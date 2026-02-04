"""
Views for the plots app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Plot
from .serializers import PlotSerializer


class PlotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Plot model.
    Provides CRUD operations and additional actions.
    """
    queryset = Plot.objects.all()
    serializer_class = PlotSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a new plot with coordinates.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        """
        Update an existing plot.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a plot.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": f"Plot '{instance.name}' deleted successfully."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def list_names(self, request):
        """
        Return a list of all plot names and IDs for the dropdown.
        """
        plots = Plot.objects.values('id', 'name')
        return Response(list(plots))

    @action(detail=True, methods=['get'])
    def center(self, request, pk=None):
        """
        Calculate and return the center point of a plot.
        """
        plot = get_object_or_404(Plot, pk=pk)
        coords = plot.coordinates
        
        if not coords:
            return Response(
                {"error": "Plot has no coordinates"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate centroid
        lat_sum = sum(c[0] for c in coords)
        lng_sum = sum(c[1] for c in coords)
        center = {
            'lat': lat_sum / len(coords),
            'lng': lng_sum / len(coords)
        }
        
        return Response({
            'id': plot.id,
            'name': plot.name,
            'center': center,
            'coordinates': coords,
            'surface_area': plot.surface_area
        })
