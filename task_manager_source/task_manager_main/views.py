from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
from django.contrib.auth.models import User
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
	return HttpResponse({'data':'cringe'})
# Create your views here.
