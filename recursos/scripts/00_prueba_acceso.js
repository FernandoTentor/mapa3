// Prueba de acceso previa a la clase. Ejecutar en el Code Editor.
// No modifica assets ni inicia exportaciones.
var region = ee.Geometry.Rectangle([-60.65, -32.15, -60.35, -31.90], null, false);
Map.centerObject(region, 10); // Centra la vista en el área didáctica.
Map.addLayer(region, {color: 'teal'}, 'Área de práctica');
// Consultar el catálogo confirma acceso al proyecto y a la colección pública.
var escenas = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(region).filterDate('2023-01-01', '2023-03-01');
print('Cantidad de gránulos encontrados', escenas.size());
