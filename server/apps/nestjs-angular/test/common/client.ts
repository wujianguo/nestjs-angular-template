import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class Client {
  private app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
  }

  url(path: string, query: { [key: string]: any } = {}) {
    const prefix = path.startsWith('/') ? '' : '/';
    return `${prefix}${path}?${new URLSearchParams(query).toString()}`;
  }

  get(path: string, query: { [key: string]: any } = {}) {
    const uri = this.url(path, query);
    return request(this.app.getHttpServer()).get(uri);
  }

  post(path: string, query: { [key: string]: any } = {}, data: any = null) {
    const uri = this.url(path, query);
    return request(this.app.getHttpServer()).post(uri).send(data);
  }

  delete(path: string, query: { [key: string]: any } = {}) {
    const uri = this.url(path, query);
    return request(this.app.getHttpServer()).delete(uri);
  }

  getHello() {
    return this.get('');
  }
}
