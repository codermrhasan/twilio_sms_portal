from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.views import View
from django.conf import settings


class CustomLoginView(View):
    template_name = 'registration/login.html'

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember_me')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            if remember_me:
                request.session.set_expiry(settings.REMEMBER_ME_EXPIRY)
            # else:
            # default builtin
            #     request.session.set_expiry(0)  # Session expires when the user closes the browser

            return redirect('home')
        else:
            error_message = 'Invalid username or password. Try again.'
            return render(request, self.template_name, {'error_message': error_message})
