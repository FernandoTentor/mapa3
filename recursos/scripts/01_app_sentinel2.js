// IDE · Maestría · Fernando Tentor · 8 y 9 de octubre de 2026.
// Copiar TODO este archivo en un script nuevo del Code Editor de Earth Engine.
// Reutiliza región, fechas y máscara del curso de teledetección.
// El objetivo aquí es compartir la visualización mediante una App.

// 1. PARÁMETROS EDITABLES. Las fechas finales son exclusivas.
var TITULO = 'Cambios de vegetación en el área de Diamante';
var AUTOR = 'Escribí tu nombre';
var INICIO_A = '2022-01-01';
var FIN_A = '2022-03-01';
var INICIO_B = '2023-01-01';
var FIN_B = '2023-03-01';
var MIN_OBS = 2; // Cantidad mínima de observaciones válidas por píxel y período.
var ROI = ee.Geometry.Rectangle([-60.65, -32.15, -60.35, -31.90], null, false);

// 2. DATOS. Se usa una colección pública, sin assets privados del docente.
var fuente = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(ROI)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 80));

// Conserva las clases SCL de vegetación, suelo y agua y escala las bandas.
// Es una máscara conservadora: también puede excluir píxeles válidos oscuros.
function preparar(imagen) {
  var scl = imagen.select('SCL');
  var valida = scl.eq(4).or(scl.eq(5)).or(scl.eq(6));
  var sr = imagen.select(['B2', 'B3', 'B4', 'B8'])
    .multiply(0.0001).updateMask(valida);
  var ndvi = sr.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return sr.addBands(ndvi).copyProperties(imagen, ['system:time_start']);
}

// Resume cada período mediante la mediana; calcula primero el NDVI por imagen.
// Una imagen vacía con bandas tipadas evita fallos por colecciones sin escenas.
function periodo(inicio, fin) {
  var escenas = fuente.filterDate(inicio, fin).map(preparar);
  var vacia = ee.Image.constant([0, 0, 0, 0, 0])
    .rename(['B2', 'B3', 'B4', 'B8', 'NDVI']).toFloat()
    .updateMask(ee.Image(0));
  var coleccion = ee.ImageCollection(ee.Algorithms.If(
    escenas.size().gt(0), escenas, ee.ImageCollection([vacia])));
  var n = coleccion.select('NDVI').count();
  return {imagen: coleccion.median().updateMask(n.gte(MIN_OBS)).clip(ROI),
    cantidad: escenas.size()};
}
var a = periodo(INICIO_A, FIN_A);
var b = periodo(INICIO_B, FIN_B);
// Negativo: menor NDVI en B. No prueba una causa ni equivale a deforestación.
var cambio = b.imagen.select('NDVI').subtract(a.imagen.select('NDVI'));

// 3. INTERFAZ. ui.Map crea el mapa que verá el visitante de la App.
var mapa = ui.Map();
mapa.centerObject(ROI, 11);
mapa.setOptions('HYBRID');
mapa.setControlVisibility({drawingToolsControl: false});
var panel = ui.Panel({style: {width: '340px', padding: '16px'}});
panel.add(ui.Label(TITULO, {fontSize: '21px', fontWeight: 'bold'}));
panel.add(ui.Label('Autoría: ' + AUTOR));
panel.add(ui.Label('Área didáctica próxima a Diamante, Entre Ríos.'));
panel.add(ui.Label('A: ' + INICIO_A + ' a ' + FIN_A + ' (fin exclusivo).'));
panel.add(ui.Label('B: ' + INICIO_B + ' a ' + FIN_B + ' (fin exclusivo).'));
panel.add(ui.Label('Elegí una capa. Usá el zoom para recorrer el área.'));
var estado = ui.Label('Comprobando disponibilidad de escenas…');
var leyenda = ui.Label('');

// Cada opción asocia una imagen con su simbología y explicación.
var opciones = {
  'Cambio de NDVI B menos A': {img: cambio,
    vis: {min: -0.4, max: 0.4, palette: ['b2182b', 'f7f7f7', '2166ac']},
    texto: 'Rojo −0,4: disminución · blanco 0 · azul +0,4: aumento de NDVI.'},
  'NDVI A': {img: a.imagen.select('NDVI'),
    vis: {min: 0, max: 0.85, palette: ['a6611a', 'f5f5f5', '018571']},
    texto: 'Marrón 0 · blanco 0,425 · verde 0,85. NDVI sin unidad.'},
  'NDVI B': {img: b.imagen.select('NDVI'),
    vis: {min: 0, max: 0.85, palette: ['a6611a', 'f5f5f5', '018571']},
    texto: 'Marrón 0 · blanco 0,425 · verde 0,85. NDVI sin unidad.'},
  'Color natural A': {img: a.imagen,
    vis: {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3},
    texto: 'Color natural. Bandas roja, verde y azul; reflectancia 0–0,3.'},
  'Color natural B': {img: b.imagen,
    vis: {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3},
    texto: 'Color natural. Bandas roja, verde y azul; reflectancia 0–0,3.'}
};
// Reemplaza la capa en vez de acumular una copia con cada cambio del selector.
function mostrar(nombre) {
  var opcion = opciones[nombre];
  mapa.layers().reset([ui.Map.Layer(opcion.img, opcion.vis, nombre)]);
  leyenda.setValue(opcion.texto);
}
var selector = ui.Select({items: Object.keys(opciones),
  value: 'Cambio de NDVI B menos A', onChange: mostrar,
  style: {stretch: 'horizontal'}});
panel.add(selector);
panel.add(leyenda);
panel.add(estado);
panel.add(ui.Label('Sin dato no significa cero. Las áreas enmascaradas dejan ver el fondo.'));
panel.add(ui.Label('Un cambio puede responder a cultivos, estacionalidad, agua o calidad de observación. No es un mapa validado de daño.'));
panel.add(ui.Label('Fuente: Copernicus Sentinel‑2 SR Harmonized', {},
  'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED'));
panel.add(ui.Label('Método: máscara SCL 4/5/6, mediana temporal de índices, al menos ' + MIN_OBS + ' observaciones válidas.'));
panel.add(ui.Button('Volver al área de estudio', function() { mapa.centerObject(ROI, 11); }));

// 4. MONTAJE. La App usa el panel y el mapa; no depende de la consola del editor.
ui.root.clear();
ui.root.add(ui.SplitPanel({firstPanel: panel, secondPanel: mapa,
  orientation: 'horizontal', wipe: false, style: {stretch: 'both'}}));
mostrar('Cambio de NDVI B menos A');

// Consulta asíncrona: actualiza un mensaje sin bloquear la interfaz.
ee.Dictionary({A: a.cantidad, B: b.cantidad}).evaluate(function(res, error) {
  if (error) { estado.setValue('No se pudo consultar el catálogo. Revisá conexión y permisos.'); return; }
  estado.setValue('Gránulos disponibles: A = ' + res.A + '; B = ' + res.B +
    '. No equivalen a días únicos ni a observaciones válidas por píxel.');
  if (res.A === 0 || res.B === 0) {
    estado.setValue('Un período no tiene escenas. Cambiá fechas o región y volvé a ejecutar.');
  }
});
// 5. PUBLICACIÓN MANUAL. Guardar > Apps > New App > proyecto habilitado.
// Probar la URL publicada sin sesión. Guardar este .js en la entrega.
