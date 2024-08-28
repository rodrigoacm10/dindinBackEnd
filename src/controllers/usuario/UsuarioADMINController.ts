import { ValidationError } from "sequelize";
import { gerarToken } from "../../middleware/Autenticacao";
import { UsuarioRepo } from "../../repository/usuario/UsuarioRepo";
import HttpStatusCode from "../../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../../utils/ObjetoDeComunicacao";

class UsuarioADMINController {
  async adicionar(body: any): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      //const novoUsuario: UsuarioMEI = dados;
      // await new UsuarioRepo().adicionar(novoUsuario);

      let usuarioDados: objetoDeComunicacao = await new UsuarioRepo().adicionar(
        body
      );

      let token: string = gerarToken(
        usuarioDados.data.usuario_id,
        usuarioDados.data.email,
        usuarioDados.data.categoria_conta,
        usuarioDados.data.nivel_acesso
      );
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        {
          // usuario_id: usuarioDados.data.usuario_id,
          token: token,
          // nome: usuarioDados.data.nome,
        },
        "Usuario ADMIN cadastrado com sucesso."
      );

      //await UsuarioMEI.build().validate();
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async obterPorId(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      resultado = await new UsuarioRepo().obterPorId(usuarioId);

      delete resultado.data.senha;

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async atualizar(usuario: any): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      resultado = await new UsuarioRepo().atualizar(usuario);

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async excluir(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      resultado = await new UsuarioRepo().excluir(usuarioId);

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }
}

export default new UsuarioADMINController();
