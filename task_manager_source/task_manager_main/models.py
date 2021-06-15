from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.db.models.deletion import CASCADE
from gettext import gettext as _
from pathlib import Path
from colorfield.fields import ColorField
from re import findall
import os


def file_dir(instance, filename):
		files_dir = Task.objects.select_related().filter(pk=instance.task_id)[0]
		if files_dir:
			return Path(os.getenv('STORAGE_PATH') + os.sep + "Task__" + str(files_dir.pk) + os.sep + filename)
		else:
			raise ObjectDoesNotExist


class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=CASCADE, verbose_name='пользователь')
	first_name = models.CharField(max_length=120, verbose_name='имя')
	second_name = models.CharField(max_length=120, verbose_name='фамилия')
	patronymic = models.CharField(max_length=120, verbose_name='отчество')

	# hook on the user saving
	@receiver(post_save, sender=User)
	def create_user_profile(sender, instance, created, **kwargs):
		if created:
			profile_obj = Profile.objects.create(user=instance)
			profile_obj.first_name = instance.first_name
			profile_obj.second_name = instance.last_name
			profile_obj.patronymic = ''
	
	# hook on the user update
	@receiver(post_save, sender=User)
	def save_user_profile(sender, instance, **kwargs):
		instance.profile.first_name = instance.first_name
		instance.profile.second_name = instance.last_name
		
		if (instance.profile.first_name is not instance.first_name or
		    instance.profile.second_name is not instance.last_name):

			instance.profile.patronymic = ''
		instance.profile.save()

	def __str__(self):
		return self.second_name + ' ' + self.first_name + ' ' + self.patronymic


class Status(models.Model):
	name = models.CharField(max_length=80, verbose_name='название')
	color = ColorField(default='#FFFFFF')
	
	def __str__(self):
		return self.name


class Task(models.Model):
	task_name = models.CharField(max_length=280, verbose_name='название задачи')
	description = models.TextField(verbose_name='описание', null=True)
	author = models.ForeignKey(User, on_delete=CASCADE, related_name='author')
	performer = models.ForeignKey(User, on_delete=CASCADE, related_name='assignee')
	date_begin = models.DateTimeField(verbose_name='время начала работ', null=True, auto_now=True)
	status = models.ForeignKey(Status, on_delete=CASCADE, null=True)
	date_of_creation = models.DateTimeField(verbose_name='время создания задачи', null=True, auto_now=True)
	date_end = models.DateTimeField(verbose_name='время завершения задачи', null=True)
	

	def __str__(self):
		return self.task_name + '_' + str(self.date_of_creation)


class File(models.Model):
	filename = models.CharField(max_length=260, null=False)
	file = models.FileField(null=True, blank=True, upload_to=file_dir)
	task = models.ForeignKey(Task, on_delete=CASCADE, null=False, blank=False)

	def clean(self):
		if len(findall(r'[@!%+|><\"?*:\/\\]+', self.filename)) > 0:
			raise ValidationError(
				'Недопустимое имя файла: %(value)s',
				code='invalid',
				params={'value': self.filename}
			)
	
	def save(self):
		super().save()
			
	def __str__(self):
		return self.filename

@receiver(pre_delete, sender=File)
def delete_file(sender, instance, **kwargs):
	possible_file = Path(instance.file.name)
	
	if possible_file.is_file:
		possible_file.unlink(missing_ok=True)
	if(possible_file.parent.is_dir()): 
		if len([x for x in possible_file.parent.glob('**/*') if x.is_file()]) == 0:
			possible_file.parent.rmdir()