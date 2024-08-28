import { ValidationError } from "sequelize";
import { gerarToken } from "../../middleware/Autenticacao";
import { UsuarioCNPJ } from "../../models/UsuarioCNPJ";
import { UsuarioCNPJRepo } from "../../repository/usuario/UsuarioCNPJRepo";
import { UsuarioRepo } from "../../repository/usuario/UsuarioRepo";
import HttpStatusCode from "../../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../../utils/ObjetoDeComunicacao";

class UsuarioCNPJController {
  async adicionar(body: any): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      //const novoUsuario: UsuarioMEI = dados;
      // await new UsuarioRepo().adicionar(novoUsuario);

      //Verificando se existe o campo "cnpj" e se ele não esta vazio
      if (Object.keys(body).includes("cnpj") && body.cnpj) {
        await UsuarioCNPJ.build({
          usuario_id: 5,
          cnpj: body.cnpj,
        }).validate();

        let usuarioDados: objetoDeComunicacao =
          await new UsuarioRepo().adicionar(body);
        body.usuario_id = usuarioDados.data.usuario_id;
        await new UsuarioCNPJRepo().adicionar(body);

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
          "Usuario CNPJ cadastrado com sucesso."
        );
      } else {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);
      }
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
      let variavelRetorno: objetoDeComunicacao = resultado;
      resultado = await new UsuarioCNPJRepo().obterPorId(usuarioId);

      for (let key in resultado.data)
        variavelRetorno.data[key] = resultado.data[key];
      delete variavelRetorno.data.senha;

      return variavelRetorno;
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
      let user: objetoDeComunicacao = await new UsuarioCNPJRepo().obterPorId(
        usuario.usuario_id
      );
      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      if (usuario.cnpj)
        await UsuarioCNPJ.build({ cnpj: usuario.cnpj }).validate();

      resultado = await new UsuarioRepo().atualizar(usuario);
      resultado = await new UsuarioCNPJRepo().atualizar(usuario);

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

export default new UsuarioCNPJController();
