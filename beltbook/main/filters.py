from django.contrib import admin
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _


class InputFilter(admin.SimpleListFilter):
    template = 'admin/input_filter.html'

    def lookups(self, request, model_admin):
        return ((),)

    def choices(self, changelist):
        # Grab only the "all" option.
        all_choice = next(super().choices(changelist))
        all_choice['query_parts'] = (
            (k, v)
            for k, v in changelist.get_filters_params().items()
            if k != self.parameter_name
        )
        yield all_choice


class OriginalArtistFilter(InputFilter):
    parameter_name = 'original_artist'
    title = _('original artist')

    def queryset(self, request, queryset):
        if self.value() is not None:
            val = self.value()
            return queryset.filter(Q(original_artist__name__icontains=val))


class ComposerFilter(InputFilter):
    parameter_name = 'composer'
    title = _('composer')

    def queryset(self, request, queryset):
        if self.value() is not None:
            val = self.value()
            return queryset.filter(Q(composer__name__icontains=val))


class LyricistFilter(InputFilter):
    parameter_name = 'lyricist'
    title = _('lyricist')

    def queryset(self, request, queryset):
        if self.value() is not None:
            val = self.value()
            return queryset.filter(Q(lyricist__name__icontains=val))


class OwnerFilter(InputFilter):
    parameter_name = 'owner'
    title = _('owner')

    def queryset(self, request, queryset):
        if self.value() is not None:
            val = self.value()
            return queryset.filter(owner__username=val)
