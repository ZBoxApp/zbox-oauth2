# ZBox OAuth2 Users API

El Api de usuarios permite administrar los usuarios que tendrán acceso al servicio de ZBox OAuth2

## Servicios de usuario disponibles

#### Consultar los datos del usuario que inició sesión
    URL: /me
    METHOD: GET
    HEADER: Content-Type: application/json
    HEADER: Authorization: Bearer <token>

La respuesta retorna el siguiente JSON:

```json
{
  "_id": "564a042dcdbf4976812cfbf7",
  "email": "juan@ejemplo.com",
  "firstname": "Juan",
  "lastname": "Perez",
  "team": "ejemplo-com",
  "isEnabled": true,
  "chatEnabled": true,
  "role": "user",
  "isZimbra": false
}
```

    URL: /me
    METHOD: POST
    HEADER: Content-Type: application/json
    BODY: JSON

El cuerpo del mensaje debe llevar

```json
{
  "email": "juan@ejemplo.com",
  "token": "<token asignado por Zimbra>"
}
```

La respuesta retorna el siguiente JSON:

```json
{
  "_id": "564a042dcdbf4976812cfbf7",
  "email": "juan@ejemplo.com",
  "firstname": "Juan",
  "lastname": "Perez",
  "team": "ejemplo-com",
  "isEnabled": true,
  "chatEnabled": true,
  "role": "user",
  "isZimbra": false
}
```

#### Consultar los datos de un usuario

    URL: /users/:id
    METHOD: GET
    HEADER: Content-Type: application/json
    HEADER: Authorization: Bearer <token>

La respuesta retorna el siguiente JSON:

```json
{
  "_id": "564a042dcdbf4976812cfbf7",
  "email": "juan@ejemplo.com",
  "firstname": "Juan",
  "lastname": "Perez",
  "team": "ejemplo-com",
  "isEnabled": true,
  "chatEnabled": true,
  "role": "user",
  "isZimbra": false
}
```

#### Consulta los usuarios de un equipo

    URL: /users/team/:name
    METHOD: GET
    HEADER: Content-Type: application/json
    HEADER: Authorization: Bearer <token>

La respuesta retorna el siguiente JSON:

```json
[
    {
        "_id": "5647a08c6fd1794600bf3fbe",
        "team": "ejemplo-com",
        "lastname": "Juan",
        "firstname": "Perez",
        "email": "juan@ejemplo.com",
        "isEnabled": true,
        "chatEnabled": true,
        "role": "user",
        "isZimbra": true
    },
    {
        "_id": "5647a0aa6fd1794600bf3fc2",
        "team": "ejemplo-com",
        "lastname": "admin",
        "firstname": null,
        "email": "admin@ejemplo.com",
        "isEnabled": false,
        "chatEnabled": true,
        "role": "user",
        "isZimbra": true
    },
    {
        "_id": "564a042dcdbf4976812cfbf7",
        "email": "luis@gmail.com",
        "firstname": "Luis",
        "lastname": "Gomez",
        "team": "ejemplo-com",
        "isEnabled": true,
        "chatEnabled": true,
        "role": "admin",
        "isZimbra": false
    }
]
```

#### Crear un nuevo usuario

    URL: /users/create
    METHOD: POST
    HEADER: Content-Type: application/json
    HEADER: Authorization: Bearer <token>
    BODY: JSON

El cuerpo del mensaje debe llevar

```json
{
    "email": "luis@ejemplo.com",
    "password": "12345678",
    "firstname": "Luis",
    "lastname": "Gomez",
    "team": "ejemplo-com",
    "isEnabled": true,
    "chatEnabled": true,
    "role": "admin"
    }
```

Los datos obligatorios para crear un usuarios son `email, password y team`

La respuesta retorna el siguiente JSON:

```json
{
    "_id": "5647a08c6ee1794600bf3fbe",
    "team": "ejemplo-com",
    "lastname": "Luis",
    "firstname": "Gomez",
    "email": "luis@ejemplo.com",
    "isEnabled": true,
    "chatEnabled": true,
    "role": "admin",
    "isZimbra": false
  }
```

#### Para actualizar los datos de un usuario

    URL: /users/update
    METHOD: PATCH
    HEADER: Content-Type: application/json
    HEADER: Authorization: Bearer <token>
    BODY: JSON

El cuerpo del mensaje debe llevar

```json
{
    "_id": "5647a08c6ee1794600bf3fbe",
    "email": "luis@ejemplo.com",
    "password": "12345678",
    "firstname": "Luis Guillermo",
    "lastname": "Gomez",
    "isEnabled": false,
    "chatEnabled": true,
    "role": "admin"
    }
```

Los datos obligatorios para actualizar un usuarios es el `_id`, sólo se actualizarán aquellos datos que hayan sido suministrados.

`Nota: Si el usuario corresponde a un usuario proveniente de Zimbra no podrán actualizarse sus datos por esta vía.`

La respuesta retorna `true`

#### Para eliminar un usuario

    URL: /users/:id
    METHOD: DELETE
    HEADER: Content-Type: application/json
    HEADER: Authorization: Bearer <token>

La respuesta retorna `true`

### Respuestas con error

Todos los servicios antes descritos pueden retornar error, en ese caso se obtiene el status code de HTTP correspondiente.
(ejemplos son: 404, 400, 409, 500, etc...)

En el caso de obtener un error todos tienen la siguiente estructura a excepción del 401 (Unauthorized):

```json
{
  "type": "Bad Request",
  "message": "Setting the user email is mandatory"
}
```