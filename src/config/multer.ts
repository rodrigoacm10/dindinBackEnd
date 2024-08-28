import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Request, Express } from "express";

class Multer {
  public storage: any;
  public destination: any;

  constructor() {
    (this.destination = path.resolve(__dirname, "..", "..", "uploads")),
      (this.storage = multer.diskStorage({
        destination: this.destination,
        filename: this.generateFileName,
      }));
  }

  private generateFileName(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ): void {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(
      file.originalname
    )}`;
    callback(null, uniqueName);
  }
}

const multerInstance = new Multer();
export const upload = multer({ storage: multerInstance.storage });
export const uploadPath = multerInstance.destination;
