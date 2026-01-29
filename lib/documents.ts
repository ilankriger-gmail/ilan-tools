import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// In production (Vercel), use bundled content/ dir; locally, use the sibling second-brain/ folder
const BRAIN_DIR = fs.existsSync(path.join(process.cwd(), 'content'))
  ? path.join(process.cwd(), 'content')
  : path.join(process.cwd(), '..', 'second-brain');

export interface Document {
  slug: string;
  folder: string;
  filename: string;
  title: string;
  date: string;
  type: string;
  tags: string[];
  summary: string;
  content: string;
  wordCount: number;
  relativePath: string;
}

const TYPE_MAP: Record<string, string> = {
  journal: 'journal',
  notes: 'note',
  research: 'research',
  ideas: 'idea',
  reports: 'report',
  projects: 'project',
};

const ICON_MAP: Record<string, string> = {
  journal: '📔',
  note: '📝',
  research: '🔬',
  idea: '💡',
  report: '📊',
  project: '📁',
};

export function getIcon(type: string): string {
  return ICON_MAP[type] || '📄';
}

function inferType(filePath: string): string {
  const rel = path.relative(BRAIN_DIR, filePath);
  const topFolder = rel.split(path.sep)[0];
  return TYPE_MAP[topFolder] || 'note';
}

function inferTitle(filename: string, content: string): string {
  // Try first H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1];
  
  // Use filename
  return filename
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/^\d{4}-\d{2}-\d{2}\s*/, '');
}

function getAllMdFiles(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllMdFiles(fullPath, files);
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

export function getAllDocuments(): Document[] {
  const files = getAllMdFiles(BRAIN_DIR);
  
  return files.map((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const filename = path.basename(filePath);
    const relativePath = path.relative(BRAIN_DIR, filePath);
    const folder = path.dirname(relativePath);
    const slug = relativePath.replace(/\.md$/, '').replace(/\//g, '__');
    
    const type = data.type || inferType(filePath);
    const title = data.title || inferTitle(filename, content);
    const date = data.date || getFileDate(filePath);
    const tags = data.tags || [];
    const summary = data.summary || content.slice(0, 150).replace(/[#*_\n]/g, ' ').trim();
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    return {
      slug,
      folder,
      filename,
      title,
      date,
      type,
      tags: Array.isArray(tags) ? tags : [tags],
      summary,
      content,
      wordCount,
      relativePath,
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

function getFileDate(filePath: string): string {
  const filename = path.basename(filePath);
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) return dateMatch[1];
  
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getDocumentBySlug(slug: string): Document | null {
  const relativePath = slug.replace(/__/g, '/') + '.md';
  const fullPath = path.join(BRAIN_DIR, relativePath);
  
  if (!fs.existsSync(fullPath)) return null;
  
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(raw);
  const filename = path.basename(fullPath);
  const folder = path.dirname(relativePath);
  const type = data.type || inferType(fullPath);
  const title = data.title || inferTitle(filename, content);
  const date = data.date || getFileDate(fullPath);
  const tags = data.tags || [];
  const summary = data.summary || content.slice(0, 150).replace(/[#*_\n]/g, ' ').trim();
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  return {
    slug,
    folder,
    filename,
    title,
    date,
    type,
    tags: Array.isArray(tags) ? tags : [tags],
    summary,
    content,
    wordCount,
    relativePath,
  };
}

export interface FolderTree {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: FolderTree[];
  docSlug?: string;
  docType?: string;
}

export function getFolderTree(): FolderTree[] {
  const docs = getAllDocuments();
  const root: FolderTree[] = [];
  
  for (const doc of docs) {
    const parts = doc.relativePath.split('/');
    let current = root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');
      
      if (isFile) {
        current.push({
          name: doc.title,
          path: currentPath,
          type: 'file',
          docSlug: doc.slug,
          docType: doc.type,
        });
      } else {
        let folder = current.find(n => n.type === 'folder' && n.name === part);
        if (!folder) {
          folder = { name: part, path: currentPath, type: 'folder', children: [] };
          current.push(folder);
        }
        current = folder.children!;
      }
    }
  }
  
  // Sort: folders first, then files
  const sortTree = (nodes: FolderTree[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(n => n.children && sortTree(n.children));
  };
  sortTree(root);
  
  return root;
}

export function getStats() {
  const docs = getAllDocuments();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  
  const byType: Record<string, number> = {};
  let recentCount = 0;
  let totalWords = 0;
  
  for (const doc of docs) {
    byType[doc.type] = (byType[doc.type] || 0) + 1;
    if (doc.date >= weekAgoStr) recentCount++;
    totalWords += doc.wordCount;
  }
  
  return {
    total: docs.length,
    byType,
    recentCount,
    totalWords,
  };
}
