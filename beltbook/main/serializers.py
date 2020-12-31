from django.conf import settings
from rest_framework import serializers

from .models import Song, Show, Artist, Book


class NameSlugRelatedField(serializers.SlugRelatedField):
    def __init__(self, slug_field=None, **kwargs):
        super().__init__(slug_field=slug_field, **kwargs)

    def use_pk_only_optimization(self):
        # DRF will try to return PKOnlyObject for ForeignKey Field
        return False

    def to_representation(self, value):
        return {
            'slug': super().to_representation(value),
            'name': value.name,
            'id': value.pk,
        }


# Serializers define the API representation.
class SongSerializer(serializers.HyperlinkedModelSerializer):
    show = NameSlugRelatedField(read_only=True, slug_field='slug')
    original_artist = NameSlugRelatedField(read_only=True, many=True, slug_field='slug')
    composer = NameSlugRelatedField(read_only=True, many=True, slug_field='slug')
    lyricist = NameSlugRelatedField(read_only=True, many=True, slug_field='slug')

    class Meta:
        model = Song
        fields = '__all__'
        lookup_field = 'slug'
        ordering = ['id']
        extra_kwargs = {
            'url': {'lookup_field': 'slug'}
        }


class ShowSerializer(serializers.HyperlinkedModelSerializer):
    songs = SongSerializer(many=True)

    class Meta:
        model = Show
        fields = ['url', 'name', 'slug', 'songs']
        lookup_field = 'slug'
        ordering = ['id']
        extra_kwargs = {
            'url': {'lookup_field': 'slug'}
        }


class ArtistSerializer(serializers.HyperlinkedModelSerializer):
    songs_as_artist = SongSerializer(many=True)
    songs_as_composer = SongSerializer(many=True)
    songs_as_lyricist = SongSerializer(many=True)

    class Meta:
        model = Artist
        fields = ['url', 'name', 'slug', 'songs_as_artist', 'songs_as_composer', 'songs_as_lyricist']
        lookup_field = 'slug'
        extra_kwargs = {
            'url': {'lookup_field': 'slug'}
        }


class BookSerializer(serializers.ModelSerializer):
    song = SongSerializer(many=True, required=False)
    slug = serializers.CharField(required=False)
    owner = serializers.StringRelatedField()

    class Meta:
        model = Book
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = settings.AUTH_USER_MODEL
        fields = ['url', 'username', 'email', 'is_staff']
