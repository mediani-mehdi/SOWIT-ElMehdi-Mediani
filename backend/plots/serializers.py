"""
Serializers for the plots app.
"""
from rest_framework import serializers
from .models import Plot


class PlotSerializer(serializers.ModelSerializer):
    """
    Serializer for the Plot model.
    """
    
    class Meta:
        model = Plot
        fields = ['id', 'name', 'coordinates', 'surface_area', 'created_at', 'updated_at']
        read_only_fields = ['surface_area', 'created_at', 'updated_at']

    def validate_coordinates(self, value):
        """
        Validate that coordinates is a list of [lat, lng] pairs.
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Coordinates must be a list.")
        
        if len(value) < 3:
            raise serializers.ValidationError("A polygon must have at least 3 points.")
        
        for i, coord in enumerate(value):
            if not isinstance(coord, (list, tuple)) or len(coord) != 2:
                raise serializers.ValidationError(
                    f"Coordinate at index {i} must be a [lat, lng] pair."
                )
            
            lat, lng = coord
            if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
                raise serializers.ValidationError(
                    f"Coordinate at index {i} must contain numeric values."
                )
            
            if not (-90 <= lat <= 90):
                raise serializers.ValidationError(
                    f"Latitude at index {i} must be between -90 and 90."
                )
            
            if not (-180 <= lng <= 180):
                raise serializers.ValidationError(
                    f"Longitude at index {i} must be between -180 and 180."
                )
        
        return value
