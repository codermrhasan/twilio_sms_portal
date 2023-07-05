from django.views import View
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from apps.portal.models import SoundProfile


class HomeView(LoginRequiredMixin, View):
    # HomeView(LoginRequiredMixin, PermissionRequiredMixin, View):
    # permission_required = 'myapp.my_permission'
    # raise_exception = True

    def get(self, request):
        sound_profile = SoundProfile.objects.filter(is_default=True).first()
        return render(request, 'portal/home.html', {'sound_profile': sound_profile})
    


