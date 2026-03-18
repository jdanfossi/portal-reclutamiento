import { google } from 'googleapis';
import { Readable } from 'stream';

const getDriveService = () => {
  const credentialsString = process.env.GOOGLE_DRIVE_CREDENTIALS;
  if (!credentialsString) {
    throw new Error("GOOGLE_DRIVE_CREDENTIALS environment variable is not defined");
  }

  const credentials = JSON.parse(credentialsString);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

export const createVacancyFolder = async (folderName: string): Promise<string> => {
  const drive = getDriveService();
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  if (!parentFolderId) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID environment variable is not defined");
  }

  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      supportsAllDrives: true,
      fields: 'id',
    });

    return file.data.id!;
  } catch (error) {
    console.error(`Error creating folder for ${folderName}:`, error);
    throw error;
  }
};

export const uploadFileToDrive = async (
  fileName: string,
  mimeType: string,
  buffer: Buffer,
  parentFolderId: string
): Promise<string> => {
  const drive = getDriveService();

  try {
    const fileMetadata = {
      name: fileName,
      parents: [parentFolderId]
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(buffer),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      supportsAllDrives: true,
      media: media,
      fields: 'id',
    });

    return file.data.id!;
  } catch (error) {
    console.error(`Error uploading file ${fileName}:`, error);
    throw error;
  }
};
