export class StorageService {
  alias: string;
  constructor(alias: string) {
    this.alias = alias;
  }

  setKey(key: string, value: string) {
    localStorage.setItem(`${this.alias}_${key}`, value);
  }

  getKey(key: string) {
    return localStorage.getItem(`${this.alias}_${key}`);
  }
}
