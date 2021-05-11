import os
from re import sub
from task_manager_main.models import Profile, Status, Task, Comment, File
from django.contrib.auth import authenticate, login, logout
from pathlib import Path
from django.contrib.auth.signals import user_logged_in
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.template import loader
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from pytz import timezone

import json

def index(request):
	return render(request, 'index.html')


def try_to_authenticate(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		try:
			username = data['username']
			password_raw = data['password']
			
			user = authenticate(username=username, password=password_raw)
			if user is not None:
				login(request, user)
				return HttpResponse(status=200)
			else:
				return HttpResponse(status=404)
		except KeyError as e:
			return HttpResponse(status=400)
	return HttpResponse(status=403)

def get_current_user(request):
	if request.user.is_authenticated:
		return JsonResponse({'data':request.user.profile.__str__()})
	else:
		return HttpResponse(status=403)

def try_to_logout(request):
	if request.user.is_authenticated:
		logout(request)
		return HttpResponse(status=200)
	else:
		return HttpResponse(status=404)

def try_to_save_new_task(request):
	if request.method == 'POST' and request.user.is_authenticated:
		if 'task' in request.POST:
			request_task_data = json.loads(request.POST['task'])

			try:
				new_task_status = Status.objects.get(name=request_task_data['status']).id
			except ObjectDoesNotExist as err:
				return HttpResponse(status= 404, content=json.dumps({'message': 'Указанный статус не найден'}))
			if type(request_task_data['title']) is str and request_task_data['title'].strip() != '':
				new_task_title = request_task_data['title'].strip()
			else:
				return HttpResponse(status=422, content=json.dumps({'message': 'Введённые данные содержат пустые поля'}))
			try:
				new_task_assignee = User.objects.select_related().filter(pk=Profile.objects.get(pk=request_task_data['assignee']).id)[0]
			except ObjectDoesNotExist as err:
				return HttpResponse(status= 404, content=json.dumps({'message': 'Указанный исполнитель не найден среди пользователей'}))
			except KeyError as err:
				return HttpResponse(status= 404, content=json.dumps({'message': 'Указанный исполнитель не найден среди пользователей'}))
			try:
				new_date_start = request_task_data['date_begin']
				new_date_end = request_task_data['date_end']
				if(new_date_start['date'] is None or new_date_start['time'] is None):
					new_task_date_start = datetime.now()
				else:
					new_task_date_start = datetime.strptime(new_date_start['date'] + " " + new_date_start['time'], '%Y-%m-%d %H:%M') 
				new_task_date_end = datetime.strptime(new_date_end['date'] + " " + new_date_end['time'], '%Y-%m-%d %H:%M') 
			except ValueError as err:
				return HttpResponse(status = 422, content=json.dumps({'message': 'Был получен неверный формат даты'}))

			if request_task_data['description'].strip() != '':
				new_task_description = request_task_data['description']
			else:
				new_task_description = None
			
			file_data = [x for x in request.FILES.values()]
			file_names = [sub(r'[\(\)]', '', sub(r'\s','_',x)) for x in request.FILES.keys()]
			# Creating db entry

			final_files_data = file_data.copy()
			final_files_name = file_names.copy()

			if request_task_data['id'] is not None and Task.objects.filter(pk=request_task_data['id']).exists():
				task_object = Task.objects.get(pk=request_task_data['id'])
				working_dir = Path(os.getenv('STORAGE_PATH') + os.sep + "Task__" + str(task_object.id))
				work_dir_file_paths = working_dir.glob('**/*')
				work_dir_files = [x.name for x in work_dir_file_paths]
				# compare files from request with task folder and overwrite existing
				if(working_dir.is_dir()):
					for i in range(0, len(work_dir_files)):
						try:
							if work_dir_files[i] not in file_names:
								file_to_delete = File.objects.get(filename = work_dir_files[i], task=task_object)
								Path.unlink(Path(str(working_dir) + os.sep + work_dir_files[i]))
								file_to_delete.delete()
							else:
								file_to_rewrite = File.objects.get(filename = work_dir_files[i], task=task_object)
								file_to_rewrite.file = file_data[i]
								Path.unlink(Path(str(working_dir) + os.sep + work_dir_files[i]))
								file_to_rewrite.save()
								final_files_data.remove(file_data[i])		
								final_files_name.remove(file_names[i])		
						except ObjectDoesNotExist as err:
							print(err)
							return HttpResponse(status = 404, content=json.dumps({'message': 'Файл не найден'}))
			else:
				task_object = Task()
				task_object.author = request.user
				task_object.commentary = request_task_data['commentary']

			task_object.task_name = new_task_title
			task_object.description = new_task_description
			task_object.performer = new_task_assignee
			task_object.date_begin = new_task_date_start
			task_object.date_end = new_task_date_end
			task_object.status = Status.objects.get(pk=new_task_status)
			try:
				task_object.save()
			except Exception as err:
				return HttpResponse(status = 500, content=json.dumps({'message': err}))

			
			try:
				for i in range(0, len(final_files_data)):
					new_file = File()
					new_file.file = final_files_data[i]
					new_file.filename = final_files_name[i]
					new_file.task = task_object
					new_file.save()
			except Exception as err:
				return HttpResponse(status = 500, content={'message': err})

			return HttpResponse(status = 200, content=json.dumps({'task_created_id': task_object.id, 'message': 'Запись успешно создана'}))
			
	else: 
		return HttpResponse(status = 403, content=json.dumps({'message': 'Для сохранения записи необходимо авторизоваться'}))