export interface GoogleDocFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleDocElement {
  textRun?: {
    content: string;
  };
}

export interface GoogleDocParagraph {
  elements?: {
    textRun?: {
      content: string;
      textStyle?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
      };
    };
  }[];
  paragraphStyle?: {
    namedStyleType?: string;
  };
}

export interface GoogleDocDetail {
  documentId: string;
  title: string;
  body?: {
    content?: {
      paragraph?: GoogleDocParagraph;
    }[];
  };
}

/**
 * List Google Docs files from user's Google Drive
 */
export async function listGoogleDocs(accessToken: string, querySearch: string = ''): Promise<GoogleDocFile[]> {
  let q = "mimeType='application/vnd.google-apps.document' and trashed=false";
  if (querySearch.trim()) {
    q += ` and name contains '${querySearch.trim().replace(/'/g, "\\'")}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=modifiedTime%20desc&pageSize=20&fields=files(id,name,modifiedTime,webViewLink,iconLink)`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Google Docs (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Get detailed document content from Google Docs API
 */
export async function getGoogleDoc(accessToken: string, documentId: string): Promise<GoogleDocDetail> {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to load document (${response.status})`);
  }

  return await response.json();
}

/**
 * Create a new Google Doc
 */
export async function createGoogleDoc(accessToken: string, title: string, initialContent?: string): Promise<GoogleDocDetail> {
  const createUrl = 'https://docs.googleapis.com/v1/documents';

  const response = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create Google Doc (${response.status})`);
  }

  const newDoc: GoogleDocDetail = await response.json();

  if (initialContent && initialContent.trim() && newDoc.documentId) {
    await insertTextToGoogleDoc(accessToken, newDoc.documentId, initialContent.trim(), 1);
  }

  return newDoc;
}

/**
 * Append or insert text into an existing Google Doc
 */
export async function insertTextToGoogleDoc(
  accessToken: string,
  documentId: string,
  text: string,
  index: number = 1
): Promise<void> {
  const batchUrl = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;

  const requests = [
    {
      insertText: {
        location: { index },
        text: text.endsWith('\n') ? text : text + '\n',
      },
    },
  ];

  const response = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to update document (${response.status})`);
  }
}

/**
 * Extract plain text or simple structured string representation from Google Doc body
 */
export function extractPlainTextFromGoogleDoc(doc: GoogleDocDetail): string {
  if (!doc.body?.content) return '';

  let result = '';
  for (const block of doc.body.content) {
    if (block.paragraph?.elements) {
      for (const el of block.paragraph.elements) {
        if (el.textRun?.content) {
          result += el.textRun.content;
        }
      }
    }
  }
  return result;
}
