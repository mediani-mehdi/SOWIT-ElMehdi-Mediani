"""
Models for the plots app.
"""
from django.db import models


class Plot(models.Model):
    """
    Model to store polygon plots with their coordinates.
    """
    name = models.CharField(max_length=255)
    farm_name = models.CharField(max_length=255, blank=True, null=True, help_text="Name of the farm (Exploitation)")
    crop_type = models.CharField(max_length=255, blank=True, null=True, help_text="Type of crop")
    has_manager = models.BooleanField(default=False, help_text="Whether a plot manager is assigned")
    coordinates = models.JSONField(help_text="List of [lat, lng] coordinates forming the polygon")
    surface_area = models.FloatField(null=True, blank=True, help_text="Surface area in hectares")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def calculate_surface_area(self):
        """
        Calculate the surface area of the polygon using the shoelace formula.
        Returns area in hectares.
        """
        if not self.coordinates or len(self.coordinates) < 3:
            return 0
        
        coords = self.coordinates
        n = len(coords)
        area = 0
        
        for i in range(n):
            j = (i + 1) % n
            area += coords[i][1] * coords[j][0]  # lng1 * lat2
            area -= coords[j][1] * coords[i][0]  # lng2 * lat1
        
        area = abs(area) * 0.5
        
        # Convert to hectares (rough approximation)
        # At equator, 1 degree ≈ 111.32 km
        # 1 square degree ≈ 12390 km² ≈ 1239000 hectares
        hectares = area * 12390  # Approximate conversion
        
        return round(hectares, 4)

    def save(self, *args, **kwargs):
        # Auto-calculate surface area before saving
        if self.coordinates and len(self.coordinates) >= 3:
            self.surface_area = self.calculate_surface_area()
        super().save(*args, **kwargs)
