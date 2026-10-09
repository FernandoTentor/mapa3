@echo off
REM Abrir este archivo desde OSGeo4W Shell, incluido con QGIS.
REM La carpeta se resuelve desde la ubicación del propio script.
pushd "%~dp0.."
REM Convierte los tres polígonos ficticios a una pirámide de teselas vectoriales.
REM El nombre interno zonas debe coincidir con source-layer en el visor.
ogr2ogr -f PMTiles web\maplibre\zonas_generadas.pmtiles datos\zonas_didacticas.geojson -nln zonas -dsco MINZOOM=8 -dsco MAXZOOM=14
if errorlevel 1 goto error
REM Reorganiza el raster real de respaldo como COG comprimido.
gdal_translate -of COG -co COMPRESS=DEFLATE datos\sentinel2_B04_recorte_cog.tif datos\mi_cog.tif
if errorlevel 1 goto error
echo Listo. Se generaron zonas_generadas.pmtiles y mi_cog.tif.
popd
exit /b 0
:error
echo No se completo la conversion. Revisar la salida y la version de GDAL.
popd
exit /b 1
