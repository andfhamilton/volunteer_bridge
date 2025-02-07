from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from .serializers import UserSerializer

@api_view(['GET'])
def test_view(request):
    return Response({"message": "Accounts API is working!"})



class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    
    def get_queryset(self):
        if self.action == 'volunteers':
            return User.objects.filter(is_volunteer=True)
        return User.objects.all()

    @action(detail=False, methods=['get'])
    def volunteers(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
