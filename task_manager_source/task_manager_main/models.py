from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models.deletion import CASCADE
from gettext import gettext as _

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=CASCADE)
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
			profile_obj.patronymic = ""
	
	# hook on the user update
	@receiver(post_save, sender=User)
	def save_user_profile(sender, instance, **kwargs):
		instance.profile.first_name = instance.first_name
		instance.profile.second_name = instance.last_name
		
		if (instance.profile.first_name is not instance.first_name or
		    instance.profile.second_name is not instance.last_name):

			instance.profile.patronymic = ""
		instance.profile.save()

	def __str__(self):
		return self.first_name + ' ' + self.second_name + ' ' + self.patronymic

# Create your models here.
