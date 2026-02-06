"""
Models for the plots app.
"""
from django.db import models
import math


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
        Calculate the surface area of the polygon.
        Projects coordinates to a local flat plane (in meters) and then calculates area.
        Returns area in hectares.
        """
        if not self.coordinates or len(self.coordinates) < 3:
            return 0
        
        coords = self.coordinates
        
        # Calculate center latitude to determine longitude conversion factor
        latitudes = [c[0] for c in coords]
        center_lat = sum(latitudes) / len(latitudes)
        
        # Conversion factors (approximate meters per degree)
        # 1 deg latitude ~= 111,320 meters
        # 1 deg longitude ~= 111,320 * cos(latitude) meters
        METERS_PER_DEG_LAT = 111320
        METERS_PER_DEG_LNG = 111320 * math.cos(math.radians(center_lat))
        
        # Convert to local meter coordinates (relative to the first point to keep numbers smaller)
        ref_lat, ref_lng = coords[0]
        projected_coords = []
        
        for lat, lng in coords:
            y = (lat - ref_lat) * METERS_PER_DEG_LAT
            x = (lng - ref_lng) * METERS_PER_DEG_LNG
            projected_coords.append((x, y))
            
        # Shoelace formula
        n = len(projected_coords)
        area_sq_meters = 0
        
        for i in range(n):
            j = (i + 1) % n
            # x_i * y_{i+1} - x_{i+1} * y_i
            area_sq_meters += projected_coords[i][0] * projected_coords[j][1]
            area_sq_meters -= projected_coords[j][0] * projected_coords[i][1]
        
        area_sq_meters = abs(area_sq_meters) * 0.5
        
        # Convert to hectares (1 ha = 10,000 m²)
        hectares = area_sq_meters / 10000
        
        return round(hectares, 4)

    def save(self, *args, **kwargs):
        # Auto-calculate surface area before saving
        if self.coordinates and len(self.coordinates) >= 3:
            self.surface_area = self.calculate_surface_area()
        super().save(*args, **kwargs)
