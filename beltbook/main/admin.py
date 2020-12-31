from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import ugettext_lazy as _
from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin
from multiselectfield.db.fields import MSFList

from .filters import OriginalArtistFilter, ComposerFilter, LyricistFilter, OwnerFilter
from .models import Song, Show, Artist, Book
from .widgets import MultiSelectWidget, NewForeignKeyWidget, TitleCaseWidget, MusicNoteWidget, NewManyToManyWidget, \
    SongTypeWidget


class SongResource(resources.ModelResource):
    title = fields.Field(column_name='Title', attribute='title', widget=TitleCaseWidget())
    show = fields.Field(column_name='Show', attribute='show', widget=NewForeignKeyWidget(Show, 'name'))
    voice_type = fields.Field(column_name='Voice Type', attribute='voice_type', widget=TitleCaseWidget())
    gender = fields.Field(column_name='Gender', attribute='gender', widget=MultiSelectWidget())
    info = fields.Field(column_name='Additional Info', attribute='info')
    character_type = fields.Field(column_name='Archetype', attribute='character_type', widget=MultiSelectWidget())
    tessitura = fields.Field(column_name='Tessitura', attribute='tessitura', widget=TitleCaseWidget())
    song_type = fields.Field(column_name='Song Type', attribute='song_type', widget=SongTypeWidget())
    character_name = fields.Field(column_name='Ch. Name', attribute='character_name', widget=TitleCaseWidget())
    low_note = fields.Field(column_name='Low Note', attribute='low_note', widget=MusicNoteWidget())
    high_note = fields.Field(column_name='High Note', attribute='high_note', widget=MusicNoteWidget())
    year = fields.Field(column_name='Year', attribute='year')
    era = fields.Field(column_name='Pre-Post', attribute='era', widget=TitleCaseWidget())
    original_artist = fields.Field(column_name='Original Artist', attribute='original_artist',
                                   widget=NewManyToManyWidget(Artist, separator='/', field='name'))
    lyricist = fields.Field(column_name='Lyricist', attribute='lyricist',
                            widget=NewManyToManyWidget(Artist, separator='/', field='name'))
    composer = fields.Field(column_name='Composer', attribute='composer',
                            widget=NewManyToManyWidget(Artist, separator='/', field='name'))

    class Meta:
        model = Song
        skip_unchanged = True
        fields = ('id', 'title', 'show', 'voice_type', 'gender', 'info', 'character_type',)

    def get_import_id_fields(self):
        return ['title', 'show']

    def get_queryset(self):
        return self._meta.model.objects.prefetch_related('original_artist',
                                                         'composer', 'lyricist').select_related('show').all()

    def skip_row(self, instance, original):
        if not self.Meta.skip_unchanged:
            return False
        for field in self.get_import_fields():
            if field.column_name == 'id':
                continue
            try:
                # For fields that are models.fields.related.ManyRelatedManager
                # we need to compare the results
                if list(field.get_value(instance).all()) != list(field.get_value(original).all()):
                    return False
            except AttributeError as e:
                instance_val = field.get_value(instance)
                original_val = field.get_value(original)
                if type(original_val) != type(instance_val):
                    if type(original_val) is MSFList:
                        if ','.join(original_val) != instance_val:
                            return False

                    elif str(original_val) != instance_val:
                        if str(original_val) == 'main.Artist.None' and instance_val is None:
                            continue
                        return False

                elif field.get_value(instance) != field.get_value(original):
                    return False
        return True


@admin.register(Song)
class SongAdmin(ImportExportModelAdmin):
    list_display = ('title', 'show_link', 'gender', 'tessitura', 'voice_type', 'song_type', 'character_type', 'year')
    resource_class = SongResource
    autocomplete_fields = ('original_artist', 'composer', 'lyricist', 'show',)
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    list_filter = (OriginalArtistFilter, ComposerFilter, LyricistFilter,
                   'voice_type', 'gender', 'tessitura',
                   'character_type', 'era', 'song_type',)

    class BookInline(admin.TabularInline):
        model = Book.song.through
        show_change_link = True

    # inlines = [BookInline, ]

    list_select_related = ('show',)

    def show_link(self, obj):
        link = reverse('admin:main_show_change', args=[obj.show.id])
        return format_html('<a href="{}">{}</a>', link, obj.show.name)

    show_link.short_description = _('Show')


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    search_fields = ['name', ]
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name', ]


@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    class SongInline(admin.TabularInline):
        model = Song
        show_change_link = True

    search_fields = ['name', ]
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name', ]
    inlines = [SongInline, ]


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    search_fields = ['name', 'owner', ]
    list_display = ('name', 'owner', 'public',)
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ('owner', 'song',)
    list_filter = (OwnerFilter, 'public',)
