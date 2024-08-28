import HttpStatusCode from "./HttpStatusCodes";

export class objetoDeComunicacao {
  private _message: number;
  private _header: HttpStatusCode | number;
  private _data: any;
  private _mensagemTexto: string;

  constructor(message: number, dados: any = {}, mensagemTexto: string = "") {
    [this._message, this._data, this._mensagemTexto] =
      this.HttpConstruirRetorno(message, dados, mensagemTexto);
    this._header = this._message;
  }
  public get message(): number {
    return this._message;
  }
  public get data(): any {
    return this._data;
  }
  public get mensagemTexto(): string {
    return this._mensagemTexto;
  }
  public get header(): number {
    return this._header;
  }

  public set message(message: number) {
    this._message = message;
  }
  public set data(dados: any) {
    this._data = dados;
  }
  public set mensagemTexto(mensagemTexto: string) {
    this._mensagemTexto = mensagemTexto;
  }
  public set header(header: HttpStatusCode) {
    this._header = header;
  }

  public toJSON() {
    return {
      status: this._message,
      message: this._mensagemTexto,
      data: this._data,
    };
  }

  public toString() {
    return `{ message: ${this._message},
        header: ${this._header}
        dados: ${this._data},
        mensagemTexto: ${this._mensagemTexto} }`;
  }

  public HttpJSONRetorno() {
    return {
      status: this._message,
      message: this._mensagemTexto,
      data: this._data,
    };
  }

  public HttpConstruirRetorno(
    codigoHttp: string | number,
    data: any = {},
    mensagem: string = ""
  ) {
    codigoHttp = +codigoHttp;

    switch (codigoHttp) {
      case HttpStatusCode.ClientErrorBadRequest:
        this._message = HttpStatusCode.ClientErrorBadRequest;
        this._header = HttpStatusCode.ClientErrorBadRequest;
        this._data = data;
        this._mensagemTexto = mensagem ? mensagem : "Requisição Invalida.";

        break;
      case HttpStatusCode.ClientErrorNotFound:
        this._message = HttpStatusCode.ClientErrorNotFound;
        this._header = HttpStatusCode.ClientErrorNotFound;
        this._data = data;
        this._mensagemTexto = mensagem ? mensagem : "Pagina não encontrada.";
        break;

      case HttpStatusCode.SuccessOK:
        this._message = HttpStatusCode.SuccessOK;
        this._header = HttpStatusCode.SuccessOK;
        this._data = data;
        this._mensagemTexto = mensagem
          ? mensagem
          : "Requisição realizada com sucesso.";

        break;

      case HttpStatusCode.ClientErrorForbidden:
        this._message = HttpStatusCode.ClientErrorForbidden;
        this._header = HttpStatusCode.ClientErrorForbidden;
        this._data = data;
        this._mensagemTexto = mensagem ? mensagem : "Acesso negado.";

        break;
      case HttpStatusCode.ClientErrorUnauthorized:
        this._message = HttpStatusCode.ClientErrorUnauthorized;
        this._header = HttpStatusCode.ClientErrorUnauthorized;
        this._data = data;
        this._mensagemTexto = mensagem ? mensagem : "Credenciais invalidas.";

        break;
      case HttpStatusCode.ClientErrorNotAcceptable:
        this._message = HttpStatusCode.ClientErrorNotAcceptable;
        this._header = HttpStatusCode.ClientErrorNotAcceptable;
        this._data = data;
        this._mensagemTexto = mensagem
          ? mensagem
          : "Informação ja cadastrada no sistema.";
        break;
      case HttpStatusCode.SuccessCreated:
        this._message = HttpStatusCode.SuccessCreated;
        this._header = HttpStatusCode.SuccessCreated;
        this._data = data;
        this._mensagemTexto = mensagem
          ? mensagem
          : "Operação inserida com sucesso.";
        break;
      default:
        (this._message = HttpStatusCode.ServerErrorInternal),
          (this._header = HttpStatusCode.ServerErrorInternal),
          (this._data = data);
        this._mensagemTexto = mensagem ? mensagem : "Erro interno do servidor.";
    }
    return [this._message, this._data, this._mensagemTexto];
  }
}
