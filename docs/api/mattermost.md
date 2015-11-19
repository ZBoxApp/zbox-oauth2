# Mattermost APIs

#### Crear un nuevo equipo

    URL: http://<url de mattermost>/api/v1/teams/create
    METHOD: POST
    HEADER: Content-Type: application/json
    BODY: JSON

El cuerpo del mensaje debe llevar

```json
{
    "display_name": "Ejemplo",
    "name": "ejemplo-com",
    "email": "admin@ejemplo.com",
    "type": "O",
    "company_name": "Ejemplo Spa",
    "allowed_domains": ""
}
```

Los datos obligatorios para crear un equipo son `name y type`

`Nota: De asignar un email, el usuario con ese email será el administrador del Equipo`

Las opciones para `type` son:
* "O" -> Corresponde al plan gratuito.
* "I" -> Corresponde al plan pagado.

La respuesta retorna el siguiente JSON:

```json
{
  "id": "wmyh8xcqbfffmcm1iemw6aycwh",
  "create_at": 1447951283155,
  "update_at": 1447951283155,
  "delete_at": 0,
  "display_name": "Ejemplo",
  "name": "ejemplo-com",
  "email": "admin@ejemplo.com",
  "type": "O",
  "company_name": "Ejemplo Spa",
  "allowed_domains": ""
}
```

