import os
from re import sub
from task_manager_main.models import *
from django.contrib.auth import authenticate, login, logout
from pathlib import Path
from django.shortcuts import render
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from django.http import HttpResponse

import json


def create_File(file_data, file_name, task):
	"""
		Создаёт объект файла и сохраняет его в базе данных

		Keyword arguments:
			file_data -- фактические данные файла
			file_name -- Форматированное наименование файла с его расширением
			task      -- Объект задачи, к которому будет записан файл

	"""
	new_file = File()
	new_file.file = file_data
	new_file.filename = file_name
	new_file.task = task
	new_file.save()

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
		profile = request.user.profile
		return HttpResponse(status=200, content=json.dumps({'profile_name':profile.__str__(), 'profile_id': profile.id}))
	else:
		return HttpResponse(status=403)


def try_to_logout(request):
	if request.user.is_authenticated:
		logout(request)
		return HttpResponse(status=200)
	else:
		return HttpResponse(status=404)


def try_to_save_task(request):
	if request.method == 'POST' and request.user.is_authenticated:
		if 'task' in request.POST:
			request_task_data = json.loads(request.POST['task'])

			# Проверка статуса 
			try:
				new_task_status = Status.objects.get(name=request_task_data['status']).id
			except ObjectDoesNotExist as err:
				return HttpResponse(status= 404, content=json.dumps({'message': 'Указанный статус не найден'}))

			# Проверка наименования задачи
			if type(request_task_data['title']) is str and request_task_data['title'].strip() != '':
				new_task_title = request_task_data['title'].strip()
			else:
				return HttpResponse(status=422, content=json.dumps({'message': 'Введённые данные содержат пустые поля'}))

			# Проверка указанного исполнителя
			try:
				profile_object = Profile.objects.get(pk=request_task_data['assignee'])
				new_task_assignee = User.objects.select_related().filter(pk=profile_object.id)[0]
			except ObjectDoesNotExist as err:
				return HttpResponse(status= 404, content=json.dumps({'message': 'Указанный исполнитель не найден среди пользователей'}))
			except KeyError as err:
				return HttpResponse(status= 404, content=json.dumps({'message': 'Указанный исполнитель не найден среди пользователей'}))

			# Проверка даты начала и окончания
			try:
				new_date_start = request_task_data['date_begin']
				new_date_end = request_task_data['date_end']
				if(new_date_start['date'] == '' or new_date_start['time'] == ''):
					new_task_date_start = datetime.now()
				else:
					new_task_date_start = datetime.strptime(new_date_start['date'] + ' ' + new_date_start['time'], '%Y-%m-%d %H:%M') 
				new_task_date_end = datetime.strptime(new_date_end['date'] + ' ' + new_date_end['time'], '%Y-%m-%d %H:%M') 
			except ValueError as err:
				return HttpResponse(status = 422, content=json.dumps({'message': 'Был получен неверный формат даты'}))

			# Проверка описания задачи
			if request_task_data['description'].strip() != '':
				new_task_description = request_task_data['description']
			else:
				new_task_description = None
			
			# Данные файлов с формы
			raw_file_data = request.FILES
			# Это уберёт все '<server_loaded>' файлы
			server_loaded_files = request.POST['server_loaded_files'].split(',')
			file_data = [x for x in raw_file_data.values()]
			file_names = [sub(r'[\(\)]', '', sub(r'\s','_',x)) for x in raw_file_data.keys()]
			final_files_data = file_data.copy()
			final_files_name = file_names.copy()

			# Создание записи в бд
			if request_task_data['id'] != '':
				try:
					task_object = Task.objects.get(pk=request_task_data['id'])
				except ObjectDoesNotExist as error:
					return HttpResponse(status = 404, content=json.dumps({'message':'При попытке сохранить задачу произошла ошибка'}))
				working_dir = Path(os.getenv('STORAGE_PATH') + os.sep + "Task__" + str(task_object.id))
				work_dir_file_paths = working_dir.glob('**/*')
				work_dir_files = [x.name for x in work_dir_file_paths]

				# compare files from request with task folder and overwrite existing
				if working_dir.is_dir():
					i = 0
					while i < len(work_dir_files):
						try:
							if work_dir_files[i] not in file_names and work_dir_files[i] not in server_loaded_files:
								file_to_delete = File.objects.get(filename = work_dir_files[i], task=task_object)
								Path.unlink(Path(str(working_dir) + os.sep + work_dir_files[i]))
								file_to_delete.delete()
								work_dir_files.remove(work_dir_files[i])
							else:
								if work_dir_files[i] not in server_loaded_files:
									file_to_rewrite = File.objects.get(filename = work_dir_files[i], task=task_object)
									file_to_rewrite.file = file_data[i]
									Path.unlink(Path(str(working_dir) + os.sep + work_dir_files[i]))
									file_to_rewrite.save()
									final_files_data.remove(file_data[i])		
									final_files_name.remove(file_names[i])	
								i += 1	
						except ObjectDoesNotExist as err:
							return HttpResponse(status = 404, content=json.dumps({'message': 'Файл не найден'}))
							
			else:
				task_object = Task()
				task_object.author = request.user

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
					create_File(final_files_data[i], final_files_name[i], task_object)
			except Exception as err:
				return HttpResponse(status = 500, content={'message': err})

			return HttpResponse(status = 200, content=json.dumps({'task_created_id': task_object.id, 'message': 'Запись успешно сохранена'}))
			
	else: 
		return HttpResponse(status = 403, content=json.dumps({'message': 'Для сохранения записи необходимо авторизоваться'}))


def try_to_delete_task(request):
	if request.method == 'POST' and request.user.is_authenticated:
		try:
			task_id = json.loads(request.POST['task_id'])
			task_to_delete = Task.objects.get(pk=task_id)

			if task_to_delete.author.id != request.user.id:
				return HttpResponse(status = 403, content=json.dumps({'message': 'Нет прав'}))
			
			task_to_delete.delete()
			return HttpResponse(status = 200, content=json.dumps({'message': 'Запись успешно удалена'}))
		except ObjectDoesNotExist as err:
			return HttpResponse(status=404, content=json.dumps({'message': 'Задачи не существует'}))
	return HttpResponse(status=500)