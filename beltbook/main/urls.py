from django.conf.urls import url
from django.urls import include
from rest_framework import routers

# ViewSets define the view behavior.
from .views import SongViewSet, ShowViewSet, ArtistViewSet, BookViewSet, voice_type, gender, tessitura, \
    song_type, character_type, era, note

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
# router.register(r'users', UserViewSet)
router.register(r'songs', SongViewSet)
router.register(r'shows', ShowViewSet)
router.register(r'artists', ArtistViewSet)
router.register(r'books', BookViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/books/(?P<username>[^/]+)/(?P<slug>[^/]+)/', BookViewSet.as_view({'get': 'retrieve'})),
    url(r'^api/voice_type/', voice_type),
    url(r'^api/gender/', gender),
    url(r'^api/tessitura/', tessitura),
    url(r'^api/song_type', song_type),
    url(r'^api/character_type', character_type),
    url(r'^api/era', era),
    url(r'^api/note', note),
    url(r'^auth/', include('rest_auth.urls')),
    url(r'^auth/registration/', include('rest_auth.registration.urls')),
]
