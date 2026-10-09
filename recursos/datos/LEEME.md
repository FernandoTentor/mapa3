# Procedencia de los datos

Preparación: 4 de octubre de 2026. Área de trabajo: Diamante y entorno, Entre Ríos, Argentina.

- `sitios_didacticos.geojson`: seis puntos ficticios. `zonas_didacticas.geojson`: tres polígonos ficticios. `base_practica.gpkg` contiene ambas capas. Fueron creados para practicar publicación y simbología; no representan mediciones, infraestructura real ni resultados científicos.
- `area_estudio.geojson`: rectángulo de selección del ejercicio, no un límite administrativo oficial.
- `ideer_localidades_respaldo.geojson`: 36 entidades obtenidas por WFS de `geonode:localidades_censales_30`, servicio https://geoservicios.entrerios.gov.ar/geoserver/ows, en la ventana -60.8,-32.3,-60.2,-31.7. Es un respaldo de aula; conservar atribución y consultar los metadatos del productor para vigencia y condiciones de reutilización. Algunos textos llegan con caracteres de reemplazo desde el servicio; no se corrigieron por inferencia.
- `sentinel2_B04_recorte_cog.tif`: recorte real de la banda roja B04 del producto Sentinel-2 L2A `S2A_20HQK_20230225_0_L2A`, obtenido del repositorio público Sentinel COGs. El JSON STAC original acompaña el archivo en `sentinel2_item_stac.json`.
- `URL_COG.txt`: ruta remota para consumir el original mediante `/vsicurl/` en QGIS/GDAL.
- `fuentes_verificadas.json`: registro de las fuentes consultadas.

El recorte se generó con GDAL desde la ventana geográfica -60.62,-31.98,-60.52,-32.08, con 512 columnas y altura automática (596 filas), formato COG y compresión DEFLATE. Está en EPSG:32720, con aproximadamente 19 m por píxel tras el remuestreo. No mantiene la resolución original de 10 m. Se conservaron números digitales: para reflectancia, el ítem STAC informa escala 0.0001 y desplazamiento -0.1; el valor 0 es nodata. El recorte por sí solo no es NDVI, temperatura ni elevación.

`web/maplibre/zonas.pmtiles` deriva de los tres polígonos ficticios. Su capa interna se llama `zonas`, con niveles de zoom 8 a 14. El número de fragmentos de teselas que informa un lector puede superar los tres objetos originales.

Actualización del 7 de octubre de 2026: `ideer_radios_respaldo.geojson` contiene 107 radios censales de `geonode:radios_30`, descargados por WFS de IDEER en EPSG:4326. La consulta usa la ventana -60.65,-32.15,-60.35,-31.9 y devuelve las geometrías completas que la intersectan, sin recortarlas. Incluye `codrad` y los campos originales del servicio. La consulta exacta está en `fuentes_verificadas.json`. Consultar los metadatos del productor para fecha del dato y condiciones de uso; la fecha de descarga no establece la fecha censal. El respaldo de localidades se conserva para los materiales que lo referencian.
