from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.db.models.deletion import CASCADE
from gettext import gettext as _
from pathlib import Path
from re import findall
import datetime
import os


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
		return self.first_name + ' ' + self.second_name + ' ' + self.patronymic


class Status(models.Model):
	name = models.CharField(max_length=80, verbose_name='название')

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
	commentary = models.BooleanField(default=False, verbose_name='содержит комментарии')

	def __str__(self):
		return self.task_name + '_' + self.date_of_creation


class Comment(models.Model):
	user = models.ForeignKey(User, on_delete=CASCADE, verbose_name='пользователь')
	date_of_creation = models.DateTimeField(verbose_name='дата создания', auto_now=True)
	task = models.ForeignKey(Task, on_delete=CASCADE, verbose_name='задача', null=False, blank=False)
	comment_text = models.TextField(verbose_name='комментарий')

	def __str__(self):
		return '#' + self.pk + '_' + self.user + ' created: ' + self.date_of_creation


class File(models.Model):
	filename = models.CharField(max_length=260, verbose_name='имя файла', help_text='имя файла не должно содержать следующих символов: @ ! . % + | > < " ? * : / \\')
	file = models.FileField(null=True, upload_to=os.getenv('STORAGE_PATH'))
	task = models.ForeignKey(Task, on_delete=CASCADE, null=False, blank=False)

	def clean(self):
		if len(findall(r'[@!.%+|><\"?*:\/\\]+', self.filename)) > 0:
			raise ValidationError(
				'Недопустимое имя файла: %(value)s',
				code='invalid',
				params={'value': self.filename}
			)

	def save(self):
		self.file.name = 'task_' + self.task.pk + '_file'
		super().save()

	def __str__(self):
		return self.filename


class TasksGraph(models.Model):
	performer = models.ForeignKey(User, on_delete=CASCADE)
	task = models.ForeignKey(Task, on_delete=CASCADE)
	date_begin = models.DateTimeField()
	date_end = models.DateTimeField()
	change_text = models.CharField(max_length=80)


@receiver(pre_delete, sender=File)
def delete_file(sender, instance, **kwargs):
	possible_file = Path(instance.file.name)
	if possible_file.is_file:
		try:
			possible_file.unlink()
		except FileNotFoundError as err:
			print(err)