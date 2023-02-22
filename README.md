# nestjs-angular-template

[![codecov](https://codecov.io/gh/wujianguo/nestjs-angular-template/branch/main/graph/badge.svg?token=JbvDW07tsh)](https://codecov.io/gh/wujianguo/nestjs-angular-template)
[![Angular 15](https://img.shields.io/badge/Angular-15-brightgreen)](https://angular.io/)
[![NestJS 9](https://img.shields.io/badge/NestJS-9-brightgreen)](https://nestjs.com/)
[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg)](LICENSE)

Nestjs + Angular template.

## Features

| Branch              | Feature                            |
| ------------------- | ---------------------------------- |
| main                | User manager and Authentication.   |
| feature/permission  | Permissions.                       |

## Development

Replace "nestjs-angular" with your project name.

```sh
docker-compose -f docker-compose.dev.yml -p="nestjs-angular" --profile dev up
```

## Production

```sh
docker-compose up -d
```


## License

This project is licensed under the [MIT license](https://opensource.org/licenses/MIT) - see the [`LICENSE`](LICENSE) file for details.
