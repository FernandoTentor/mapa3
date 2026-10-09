# Scripts guardados en Earth Engine

El 4 de octubre de 2026 se recuperaron y guardaron los dos scripts en el repositorio personal del docente:

```text
users/fernandotentor/default/Curso_Maestria_IDE_2026/00_prueba_acceso
users/fernandotentor/default/Curso_Maestria_IDE_2026/01_app_sentinel2
```

Se recargó el Code Editor y se reabrieron los archivos desde el árbol del repositorio para comprobar que su contenido persistía en el servidor. Los archivos `.js` de esta carpeta siguen siendo el respaldo local.

Después de recargar se resolvió un error inicial de autenticación. La prueba de acceso devolvió 12 gránulos; la app, que aplica además el filtro de nubosidad, se ejecutó y mostró la capa de cambio de NDVI, con 11 gránulos en el período A y 9 en B. Sigue pendiente publicar una Earth Engine App y comprobar su acceso sin sesión.

Para recuperarlos: abrir https://code.earthengine.google.com/, ir a Scripts → Owner → users/fernandotentor/default → Curso_Maestria_IDE_2026 y seleccionar el archivo. Un asterisco junto al nombre significa que hay cambios sin guardar; pulsar Save o Ctrl+S y comprobar que desaparece antes de cerrar.
