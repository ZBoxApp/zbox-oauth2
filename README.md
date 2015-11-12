# ZBox OAuth2

`ZBox OAuth2` es un servicio que utiliza a
[Zimbra PreAuth REST Service](https://github.com/ZBoxApp/zimbra-preauth-service)
para realizar autenticaciones de los usuarios registrados con Zimbra. En caso de que el login se realice sin
una secuencia de `OAuth2` el servicio redirecciona a la aplicación de `Mail`.

Además de la secuencia de autenticación también se puede consultar los datos del usuario autenticado el cual
se reconoce al enviar el token en el header `Authorization: Bearer <token>`
por medio de una consulta `GET` a la URL `/me` la cual retorna un `JSON` con
la siguiente información:

* `_id`, el identificador del usuario
* `email`, dirección de correo del usuario
* `firstname`, nombre del usuario
* `lastname`, apellido del usuario
* `zimbraUrl`, URL para ingresar directamente al Webmail la primera vez
* `chatEnabled`, identifica si el usuario tiene acceso al chat
* `isEnabled`, identifica si el usuario está activo


Por ejemplo:

```
$ curl --header "Authorization: Bearer anljLke5XEkcNoqkJOF2q8LgihommgHlZliflNsmJDT6Dq5rXiRXE8tyhpT8wnXYoIiFQNKFQQyqV8V0SkdCtjYYZwlKUSvYnJvilprjGCrQP8pfFZURzR5vOE6d84uRpq3iGXw6amn01izp3dXGDWivPT7VcGSuEV3oLGAiaJnPpRW0LNjEXUs0DloL071XEdwiKTKastxSNLvL5AM0cSbfgTYoQ2HqBoYlYqjcVF0frMde6g1swZxVk4qgetaH" http://192.168.99.100/me
```

responde con

```json
{
  "_id": "56257a734b79e6d4554ecda9",
  "zimbraUrl": "https://192.168.50.10/service/preauth?account=elias@zboxapp.dev&timestamp=1445435997594&preauth=3ff48fe588f1ab863b10628b78922c8806876a11&expires=0",
  "team": "zboxapp-dev",
  "lastname": "Nahum",
  "firstname": "Elias",
  "email": "elias@zboxapp.dev",
  "chatEnabled": true,
  "isEnabled": true,
  "__v": 0
}
```

## Uso imagen Docker

La aplicación necesita que le pases las siguientes variables de entorno para funcionar:

* `MONGO_URL`, connection string a la base de datos `mongodb://user@pwd:localhost/zboxAuth`
* `ZIMBRA_PREAUTH_HOST`, URL de Zimbra PreAuth REST Service.

Por ejemplo puedes correr con Docker ejecutando:

```
$ docker run --name zboxOAuth2 --publish 80:80 \
  -e MONGO_URL=mongodb://user:pwd@localhost/zboxOAuth \
  -e ZIMBRA_PREAUTH_HOST=http://192.168.99.100:9292 \
  -e ZIMBRA_TOKEN_URL=https://localhost:7443/service/soap/AuthRequest \
  enahum/zbox-oauth2
```

## Contributing

1. Fork it ( https://github.com/zboxapp/zbox-oauth2/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request