import { Request, Response } from 'express';
import { upload, uploadPath } from "../config/multer";
import path from 'path';
import fs from 'fs';

class FileController {
    public async uploadFile(req: Request, res: Response): Promise<string> {
        return new Promise((resolve, reject) => {
            upload.single('file')(req, res, (err: any) => {
                if (err) {
                    console.error(err); 
                    reject('Falha ao fazer upload do arquivo');
                } else {
                    const filename = req.file ? req.file.filename : "";
                    resolve(filename);
                }
            });
        });
    }

    public upload(req: Request, res: Response): void {
        try {
            upload.single('file')(req, res, (err: any) => {
                if (!req.file) {
                    res.status(400).json({file: "", message: 'Nenhum arquivo foi enviado.'});
                    return;
                }
                if (err) {
                    console.error(err);
                    res.status(500).json('Falha ao fazer upload do arquivo');
                } else {
                    const filename = req.file ? req.file.filename : '';
                    res.status(200).json({file:filename});
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro durante o upload do arquivo');
        }
    }    

    public async getFile(req: Request, res: Response) {
        try {
            const filename = req.params.filename;
            const filepath = path.resolve(uploadPath, filename); 

            const exists = await fs.promises.access(filepath)
                .then(() => true)
                .catch(() => false);
            if (!exists) {
                return res.status(404).json({ error: 'Documento/Imagem não encontrado' });
            }
            return res.sendFile(filepath);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    public async removeFileByRoute(req: Request, res: Response){
        try{
            const filename = req.params.filename;
            const filepath = path.resolve(uploadPath, filename);

            const exists = await fs.promises.access(filepath)
            .then(() => true)
            .catch(() => false);

            if (!exists) {
                return res.status(404).json({ error: 'Documento/Imagem não encontrado' });
            }

            await fs.promises.unlink(filepath);
            return res.status(200).json({message: 'Arquivo removido com sucesso!'});
        }catch(err){
            console.error(err);
            return res.status(500).json({error: "Erro interno no servidor"});
        }
    
    }

    public async removeFileByName(filename : string){
        try{
            const filepath = path.resolve(uploadPath, filename);

            const exists = await fs.promises.access(filepath)
            .then(() => true)
            .catch(() => false);

            if (!exists) {
                return false;
            }

            await fs.promises.unlink(filepath);
            console.log("ARQUIVO REMOVIDO BY NAME DA DESPESA/RECEITA");
            return true;

        }catch(err){
            console.error(err);
            throw new Error("Erro interno no servidor")
        }
    
    }

}

export default new FileController();
