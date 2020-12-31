from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.http import HttpResponse, Http404, HttpResponseBadRequest
# Create your views here.
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Song, Show, Artist, VOICE_TYPE, GENDER, TESSITURA, SONG_TYPE, CHARACTER_TYPE, ERA, NOTE, Book
from .permissions import IsOwnerOrReadOnly
from .serializers import UserSerializer, SongSerializer, ShowSerializer, ArtistSerializer, BookSerializer


def index(request):
    return HttpResponse("Hello World!")


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class SongViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Song.objects.prefetch_related('original_artist', 'composer', 'lyricist').select_related('show').all()
    serializer_class = SongSerializer
    lookup_field = 'slug'
    filter_backends = (DjangoFilterBackend, SearchFilter,)
    filterset_fields = {'voice_type': ['in', 'exact'],
                        'gender': ['in', 'exact', 'contains', 'regex'],
                        'tessitura': ['in', 'exact'],
                        'character_type': ['in', 'exact', 'contains', 'regex'],
                        'era': ['in', 'exact'],
                        'song_type': ['in', 'exact']}
    search_fields = ('title', 'show__name', 'original_artist__name', 'composer__name', 'lyricist__name',)

    @action(detail=False)
    def fields(self, request):
        return Response(map(lambda field: field.name, self.serializer_class.Meta.model._meta.fields))


class ShowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Show.objects.prefetch_related('songs', 'songs__composer', 'songs__lyricist',
                                             'songs__original_artist').all()
    serializer_class = ShowSerializer
    lookup_field = 'slug'
    filter_backends = (SearchFilter,)
    search_fields = ('name',)


class ArtistViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Artist.objects.prefetch_related('songs_as_artist',
                                               'songs_as_artist__composer', 'songs_as_artist__lyricist',
                                               'songs_as_artist__original_artist',
                                               'songs_as_artist__show',
                                               'songs_as_composer',
                                               'songs_as_composer__lyricist', 'songs_as_composer__original_artist',
                                               'songs_as_composer__composer',
                                               'songs_as_composer__show',
                                               'songs_as_lyricist',
                                               'songs_as_lyricist__original_artist', 'songs_as_lyricist__composer',
                                               'songs_as_lyricist__lyricist',
                                               'songs_as_lyricist__show').all()
    serializer_class = ArtistSerializer
    lookup_field = 'slug'
    filter_backends = (SearchFilter,)
    search_fields = ('name',)


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.prefetch_related('song', 'song__show', 'song__composer', 'song__lyricist',
                                             'song__original_artist').all()
    serializer_class = BookSerializer
    permission_classes = (IsOwnerOrReadOnly,)

    def list(self, request, *args, **kwargs):
        # TODO: return 404 or 403 for AnonymousUser
        queryset = Book.objects.filter(owner=request.user).prefetch_related('song', 'song__show',
                                                                            'song__composer',
                                                                            'song__lyricist',
                                                                            'song__original_artist').all()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        if 'username' not in kwargs or 'slug' not in kwargs:
            raise Http404
        username = kwargs['username']
        user = get_object_or_404(get_user_model(), username=username)
        slug = kwargs['slug']
        instance = get_object_or_404(Book, owner=user, slug=slug)
        if instance.owner != request.user and not instance.public:
            raise Http404
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if 'song' in request.data:
            for obj in request.data['song']:
                instance.song.add(get_object_or_404(Song, slug=obj['slug']))
            instance.save()
            serializer = self.get_serializer(instance)
        else:
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @action(methods=['PATCH'], detail=True)
    def remove_song(self, request, *args, **kwargs):
        instance = self.get_object()
        if 'song' in request.data:
            for obj in request.data['song']:
                instance.song.remove(get_object_or_404(Song, slug=obj['slug']))
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            return HttpResponseBadRequest('invalid parameters')


@api_view(['GET'])
@permission_classes([AllowAny])
def voice_type(request):
    return Response([vt[0] for vt in VOICE_TYPE])


@api_view(['GET'])
@permission_classes([AllowAny])
def gender(request):
    return Response([vt[0] for vt in GENDER])


@api_view(['GET'])
@permission_classes([AllowAny])
def tessitura(request):
    return Response([vt[0] for vt in TESSITURA])


@api_view(['GET'])
@permission_classes([AllowAny])
def song_type(request):
    return Response([vt[0] for vt in SONG_TYPE])


@api_view(['GET'])
@permission_classes([AllowAny])
def character_type(request):
    return Response([vt[0] for vt in CHARACTER_TYPE])


@api_view(['GET'])
@permission_classes([AllowAny])
def era(request):
    return Response([vt[0] for vt in ERA])


@api_view(['GET'])
@permission_classes([AllowAny])
def note(request):
    return Response([vt[0] for vt in NOTE])
