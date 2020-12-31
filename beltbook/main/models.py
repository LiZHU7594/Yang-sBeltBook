from django.conf import settings
from django.db import models
from django.utils.text import slugify
from model_utils import Choices
from model_utils.models import TimeStampedModel
from multiselectfield import MultiSelectField

VOICE_TYPE = Choices('Belt', 'Belt Mix')
GENDER = Choices('Male', 'Female')
TESSITURA = Choices('Low', 'Middle', 'High')
SONG_TYPE = Choices('Mid-Tempo', 'Uptempo', 'Ballad', 'Power Ballad')
CHARACTER_TYPE = Choices('Character', 'Young Lead', 'Lead', 'Ingenue', '2nd Banana', 'Comic')
ERA = Choices('Pre-1965', 'Post-1965')
NOTE = Choices("E2", "F2", "Gb2", "G2", "Ab2", "A2", "Bb2", "B2", "C3", "Db3", "D3", "Eb3",
               "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3", "C4", "Db4", "D4", "Eb4",
               "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4", "C5", "Db5", "D5", "Eb5",
               "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5", "C6")


def generate_unique_slug(instance=None, field=None, **kwargs):
    slug = slugify(getattr(instance, field))
    num = 1
    unique_slug = slug
    while instance._meta.model.objects.filter(slug=unique_slug, **kwargs).exists():
        unique_slug = '{}-{}'.format(slug, num)
        num += 1
    return unique_slug


class Song(models.Model):
    class Meta:
        ordering = ['title']

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, null=False)
    show = models.ForeignKey('Show', on_delete=models.SET_NULL, blank=True, null=True, related_name='songs')
    voice_type = models.CharField(max_length=20, choices=VOICE_TYPE)
    gender = MultiSelectField(choices=GENDER)
    tessitura = models.CharField(max_length=20, choices=TESSITURA)
    info = models.TextField(blank=True)
    character_type = MultiSelectField(choices=CHARACTER_TYPE)
    low_note = models.CharField(max_length=4, choices=NOTE)
    high_note = models.CharField(max_length=4, choices=NOTE)
    year = models.IntegerField()
    era = models.CharField(max_length=20, choices=ERA)
    song_type = models.CharField(max_length=20, choices=SONG_TYPE)
    character_name = models.CharField(max_length=255)
    original_artist = models.ManyToManyField('Artist', related_name='songs_as_artist', blank=True)
    lyricist = models.ManyToManyField('Artist', related_name='songs_as_lyricist', blank=True)
    composer = models.ManyToManyField('Artist', related_name='songs_as_composer', blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, 'title')
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Show(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, null=False)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, 'name')
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Artist(models.Model):
    class Meta:
        ordering = ['name']

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, null=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, 'name')
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Book(TimeStampedModel):
    class Meta:
        ordering = ['name']
        constraints = [models.UniqueConstraint(fields=['owner', 'slug'], name='unique slug for owner')]

    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    slug = models.SlugField(null=False)
    song = models.ManyToManyField('Song', blank=True)
    info = models.TextField(blank=True)
    public = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, 'name', owner=self.owner)
        else:
            new_slug = slugify(self.name)
            if not self.slug == new_slug and not self.slug[:self.slug.rfind('-')] == new_slug:
                self.slug = generate_unique_slug(self, 'name', owner=self.owner)
        super().save(*args, **kwargs)

    def __str__(self):
        return '%s - %s' % (self.owner, self.name)
