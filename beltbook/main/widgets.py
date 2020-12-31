from django.utils.encoding import force_str
from import_export.widgets import Widget, ForeignKeyWidget, CharWidget, ManyToManyWidget
from multiselectfield.db.fields import MSFList
from titlecase import titlecase


class TitleCaseWidget(CharWidget):
    def clean(self, value, row=None, *args, **kwargs):
        str_value = force_str(value.strip())
        return titlecase(str_value)


class SongTypeWidget(TitleCaseWidget):
    def clean(self, value, row=None, *args, **kwargs):
        song_type = super().clean(value)
        if song_type == 'Up-Tempo':
            song_type = 'Uptempo'
        elif song_type == 'Midtempo':
            song_type = 'Mid-Tempo'
        elif song_type == 'Power-Ballad' or song_type.lower() == 'powerballad':
            song_type = 'Power Ballad'
        return song_type


class MusicNoteWidget(CharWidget):
    equal_notes = {
        "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb",
        "Fb": "E", "E#": "F", "Cb": "B", "B#": "C"
    }

    def clean(self, value, row=None, *args, **kwargs):
        str_value = titlecase(force_str(value.strip()))
        note_name = str_value[:-1]
        if note_name in self.equal_notes:
            note_name = self.equal_notes[note_name]
        return note_name + str_value[-1:]


class MultiSelectWidget(Widget):
    def __init__(self, separator=None):
        if separator is None:
            separator = '/'
        self.separator = separator

    def clean(self, value, row=None, *args, **kwargs):
        return ','.join(titlecase(force_str(v).strip()) for v in value.split(self.separator))

    def render(self, value, obj=None):
        if type(value) is MSFList:
            return self.separator.join(force_str(v) for v in value)
        return self.separator.join(force_str(v) for v in value.split(','))


class NewForeignKeyWidget(ForeignKeyWidget):
    def clean(self, value, row=None, *args, **kwargs):
        return self.model.objects.get_or_create(
            **{self.field: titlecase(force_str(value).strip())}
        )[0] if value else None


class NewManyToManyWidget(ManyToManyWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if not value:
            return self.model.objects.none()
        values = filter(None, value.split(self.separator))
        for v in values:
            self.model.objects.get_or_create(**{self.field: titlecase(force_str(v).strip())})
        return super(NewManyToManyWidget, self).clean(value)
