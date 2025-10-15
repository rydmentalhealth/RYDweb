/**
 * Integration Service
 * Handles Google Drive and Notion integrations
 */

export interface GoogleDriveConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface NotionConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface GoogleDriveFolder {
  id: string
  name: string
  webViewLink: string
  createdTime: string
  modifiedTime: string
}

export interface NotionPage {
  id: string
  title: string
  url: string
  createdTime: string
  lastEditedTime: string
}

export class IntegrationService {
  private static googleDriveConfig: GoogleDriveConfig = {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI || '',
    scopes: ['https://www.googleapis.com/auth/drive.file']
  }

  private static notionConfig: NotionConfig = {
    clientId: process.env.NOTION_CLIENT_ID || '',
    clientSecret: process.env.NOTION_CLIENT_SECRET || '',
    redirectUri: process.env.NOTION_REDIRECT_URI || '',
    scopes: ['read', 'write']
  }

  /**
   * Google Drive Integration
   */
  static async createGoogleDriveFolder(
    projectName: string, 
    accessToken: string
  ): Promise<GoogleDriveFolder> {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Project: ${projectName}`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || 'root']
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create Google Drive folder')
      }

      const folder = await response.json()
      
      return {
        id: folder.id,
        name: folder.name,
        webViewLink: `https://drive.google.com/drive/folders/${folder.id}`,
        createdTime: folder.createdTime,
        modifiedTime: folder.modifiedTime
      }
    } catch (error) {
      console.error('Error creating Google Drive folder:', error)
      throw error
    }
  }

  static async getGoogleDriveFolder(
    folderId: string, 
    accessToken: string
  ): Promise<GoogleDriveFolder> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Google Drive folder')
      }

      const folder = await response.json()
      
      return {
        id: folder.id,
        name: folder.name,
        webViewLink: `https://drive.google.com/drive/folders/${folder.id}`,
        createdTime: folder.createdTime,
        modifiedTime: folder.modifiedTime
      }
    } catch (error) {
      console.error('Error fetching Google Drive folder:', error)
      throw error
    }
  }

  static async uploadToGoogleDrive(
    folderId: string,
    fileName: string,
    fileContent: Buffer,
    mimeType: string,
    accessToken: string
  ): Promise<{ id: string; webViewLink: string }> {
    try {
      const metadata = {
        name: fileName,
        parents: [folderId]
      }

      const form = new FormData()
      form.append('metadata', JSON.stringify(metadata))
      form.append('media', new Blob([fileContent], { type: mimeType }))

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form
      })

      if (!response.ok) {
        throw new Error('Failed to upload file to Google Drive')
      }

      const file = await response.json()
      
      return {
        id: file.id,
        webViewLink: `https://drive.google.com/file/d/${file.id}/view`
      }
    } catch (error) {
      console.error('Error uploading to Google Drive:', error)
      throw error
    }
  }

  /**
   * Notion Integration
   */
  static async createNotionPage(
    projectName: string,
    projectDescription: string,
    parentPageId: string,
    accessToken: string
  ): Promise<NotionPage> {
    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: {
            page_id: parentPageId
          },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: projectName
                  }
                }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'heading_1',
              heading_1: {
                text: [
                  {
                    text: {
                      content: projectName
                    }
                  }
                ]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                text: [
                  {
                    text: {
                      content: projectDescription
                    }
                  }
                ]
              }
            },
            {
              object: 'block',
              type: 'heading_2',
              heading_2: {
                text: [
                  {
                    text: {
                      content: 'Project Timeline'
                    }
                  }
                ]
              }
            },
            {
              object: 'block',
              type: 'heading_2',
              heading_2: {
                text: [
                  {
                    text: {
                      content: 'Team Members'
                    }
                  }
                ]
              }
            },
            {
              object: 'block',
              type: 'heading_2',
              heading_2: {
                text: [
                  {
                    text: {
                      content: 'Progress Updates'
                    }
                  }
                ]
              }
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create Notion page')
      }

      const page = await response.json()
      
      return {
        id: page.id,
        title: projectName,
        url: page.url,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time
      }
    } catch (error) {
      console.error('Error creating Notion page:', error)
      throw error
    }
  }

  static async getNotionPage(
    pageId: string,
    accessToken: string
  ): Promise<NotionPage> {
    try {
      const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Notion page')
      }

      const page = await response.json()
      
      return {
        id: page.id,
        title: page.properties.title?.title?.[0]?.text?.content || 'Untitled',
        url: page.url,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time
      }
    } catch (error) {
      console.error('Error fetching Notion page:', error)
      throw error
    }
  }

  static async updateNotionPage(
    pageId: string,
    content: any,
    accessToken: string
  ): Promise<void> {
    try {
      const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify(content)
      })

      if (!response.ok) {
        throw new Error('Failed to update Notion page')
      }
    } catch (error) {
      console.error('Error updating Notion page:', error)
      throw error
    }
  }

  /**
   * OAuth URL Generation
   */
  static getGoogleDriveAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.googleDriveConfig.clientId,
      redirect_uri: this.googleDriveConfig.redirectUri,
      response_type: 'code',
      scope: this.googleDriveConfig.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state })
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  static getNotionAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.notionConfig.clientId,
      redirect_uri: this.notionConfig.redirectUri,
      response_type: 'code',
      ...(state && { state })
    })

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`
  }

  /**
   * Token Exchange
   */
  static async exchangeGoogleDriveCode(code: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.googleDriveConfig.clientId,
          client_secret: this.googleDriveConfig.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.googleDriveConfig.redirectUri,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to exchange Google Drive code')
      }

      return await response.json()
    } catch (error) {
      console.error('Error exchanging Google Drive code:', error)
      throw error
    }
  }

  static async exchangeNotionCode(code: string): Promise<{ access_token: string }> {
    try {
      const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.notionConfig.redirectUri,
        }),
        auth: {
          username: this.notionConfig.clientId,
          password: this.notionConfig.clientSecret
        }
      })

      if (!response.ok) {
        throw new Error('Failed to exchange Notion code')
      }

      return await response.json()
    } catch (error) {
      console.error('Error exchanging Notion code:', error)
      throw error
    }
  }
}