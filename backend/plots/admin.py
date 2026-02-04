"""
Admin configuration for the plots app.
"""
from django.contrib import admin
from .models import Plot


@admin.register(Plot)
class PlotAdmin(admin.ModelAdmin):
    list_display = ['name', 'surface_area', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['name']
    readonly_fields = ['surface_area', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Plot Information', {
            'fields': ('name', 'coordinates')
        }),
        ('Calculated Data', {
            'fields': ('surface_area',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
