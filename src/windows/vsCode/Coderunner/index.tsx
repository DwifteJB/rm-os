import React, { useState, useEffect, useRef } from 'react';
import { WindowComponentProps } from "../../../types";
import { FileSystemNode } from '../types';
import { findFileRecursively } from '../utils/utils';

interface LogEntry {
  type: 'log' | 'error' | 'info' | 'warn';
  content: string[];
  timestamp: string;
}

interface CodeRunnerProps extends WindowComponentProps {
  code: string;
  language: string;
  fileSystem: FileSystemNode[];
  currentFileId: string;
}

const CodeRunner: React.FC<CodeRunnerProps> = ({ 
  code, 
  language, 
  fileSystem,
  currentFileId
}) => {
  const sandboxRef = useRef<HTMLIFrameElement>(null);
  const outputRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const formatTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const addLog = (type: LogEntry['type'], ...args: unknown[]) => {
    setLogs(prev => [...prev, {
      type,
      content: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ),
      timestamp: formatTimestamp()
    }]);
  };

  const runJavaScript = () => {
    setLogs([]);
    setResult(null);

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const sandboxHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            window.addEventListener('error', function(event) {
              window.parent.postMessage({ 
                type: 'error', 
                args: [event.message] 
              }, '*');
              event.preventDefault();
            });

            const originalConsole = window.console;
            window.console = {
              log: (...args) => {
                originalConsole.log(...args);
                window.parent.postMessage({ type: 'log', args }, '*');
              },
              error: (...args) => {
                originalConsole.error(...args);
                window.parent.postMessage({ type: 'error', args }, '*');
              },
              warn: (...args) => {
                originalConsole.warn(...args);
                window.parent.postMessage({ type: 'warn', args }, '*');
              },
              info: (...args) => {
                originalConsole.info(...args);
                window.parent.postMessage({ type: 'info', args }, '*');
              }
            };

            setTimeout(() => {
              try {
                const result = (function() {
                  ${code}
                })();
                
                if (result !== undefined) {
                  window.parent.postMessage({ 
                    type: 'result', 
                    args: [result] 
                  }, '*');
                }
              } catch (err) {
                window.parent.postMessage({ 
                  type: 'error', 
                  args: [err.message] 
                }, '*');
              }
            }, 0);
          </script>
        </head>
        <body>
          <div id="sandbox"></div>
        </body>
      </html>
    `;

    const blob = new Blob([sandboxHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    blobUrlRef.current = blobUrl;

    if (sandboxRef.current) {
      sandboxRef.current.src = blobUrl;
    }
  };

  const findScriptContent = (path: string): string | null => {
    const findFileByPath = (nodes: FileSystemNode[], targetPath: string): FileSystemNode | null => {
      for (const node of nodes) {
        if (node.type === 'file' && node.name === targetPath) {
          return node;
        }
        if (node.type === 'folder' && node.children) {
          const found = findFileByPath(node.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const scriptFile = findFileByPath(fileSystem, path);
    return scriptFile?.content || null;
  };

  const processHTMLImports = (htmlContent: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const currentFile = findFileRecursively(fileSystem, currentFileId);
    const currentDir = currentFile?.name.split('/').slice(0, -1).join('/') || '';

    const consoleScript = doc.createElement('script');
    consoleScript.setAttribute('id', 'console-capture');
    consoleScript.textContent = `
      if (!window.__consoleInitialized) {
        window.__consoleInitialized = true;
        window.console = {
          log: (...args) => {
            window.parent.postMessage({ type: 'log', args }, '*');
          },
          error: (...args) => {
            window.parent.postMessage({ type: 'error', args }, '*');
          },
          warn: (...args) => {
            window.parent.postMessage({ type: 'warn', args }, '*');
          },
          info: (...args) => {
            window.parent.postMessage({ type: 'info', args }, '*');
          }
        };
        
        window.addEventListener('error', function(event) {
          window.parent.postMessage({ 
            type: 'error', 
            args: [event.message] 
          }, '*');
          event.preventDefault();
        });
      }
    `;
    doc.head.insertBefore(consoleScript, doc.head.firstChild);

    doc.querySelectorAll('script:not(#console-capture)').forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('//')) {
        const normalizedPath = src.startsWith('./') ? src.slice(2) : src;
        const fullPath = currentDir ? `${currentDir}/${normalizedPath}` : normalizedPath;
        
        const scriptContent = findScriptContent(fullPath);
        if (scriptContent) {
          script.removeAttribute('src');
          script.textContent = scriptContent;
        }
      }
    });

    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('//')) {
            const normalizedPath = href.startsWith('./') ? href.slice(2) : href;
            const fullPath = currentDir ? `${currentDir}/${normalizedPath}` : normalizedPath;
            
            const styleContent = findScriptContent(fullPath);
            if (styleContent) {
            const style = doc.createElement('style');
            style.textContent = styleContent;
            link.replaceWith(style);
            }
        }
        }
    );

    doc.querySelectorAll('script:not(#console-capture)').forEach(script => {
        if (script.hasAttributes()) {
            script.remove();
        }
    });

    return doc.documentElement.outerHTML;
  };

  const runHTML = () => {
    setLogs([]);
    setResult(null);

    if (outputRef.current) {
      const processedHTML = processHTMLImports(code);
      const iframe = outputRef.current;
      const doc = iframe.contentDocument;
      
      if (doc) {
        doc.open();
        doc.write('<!DOCTYPE html>');
        doc.close();
        
        doc.open();
        doc.write(processedHTML);
        doc.close();

        
      }
    }
  };

  const handleMessage = (event: MessageEvent) => {
    if (!event.data || typeof event.data !== 'object') return;
    
    const { type, args } = event.data;
    if (!type || !args) return;
  
    if (type === 'result') {
      setResult(
        typeof args[0] === 'object' 
          ? JSON.stringify(args[0], null, 2) 
          : String(args[0])
      );
    } else {
        const duplicateIndex = logs.findIndex(log => log.timestamp === formatTimestamp());
        if (duplicateIndex > -1) {
          setLogs(prev => prev.filter((_, index) => index !== duplicateIndex));
        }

      addLog(type as LogEntry['type'], ...args);
    }
  };
  
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (language === 'javascript') {
      runJavaScript();
    } else if (language === 'html') {
      runHTML();
    }
  }, [code, language]);

  const renderLogEntry = (entry: LogEntry) => {
    const colorClass = {
      log: 'text-white',
      error: 'text-red-500',
      warn: 'text-yellow-500',
      info: 'text-blue-500'
    }[entry.type];

    return (
      <div className={`font-mono text-sm ${colorClass} mb-1`}>
        <span className="text-gray-500 text-xs mr-2">[{entry.timestamp}]</span>
        {entry.content.join(' ')}
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col">
      <iframe 
        ref={sandboxRef}
        className="hidden"
        sandbox="allow-scripts"
        title="sandbox"
      />
      
      {language === 'html' ? (
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <iframe 
              ref={outputRef}
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="preview"
            />
          </div>
          {logs.length > 0 && (
            <div 
              ref={consoleRef}
              className="h-32 p-4 border-t border-gray-700 bg-[#1e1e1e] text-white text-sm font-mono whitespace-pre-wrap overflow-auto"
            >
              {logs.map((log, index) => (
                <div key={index}>{renderLogEntry(log)}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div 
          className="p-4 text-white text-sm font-mono whitespace-pre-wrap overflow-auto h-full"
        >
          {logs.map((log, index) => (
            <div key={index}>{renderLogEntry(log)}</div>
          ))}
          {result && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <span className="text-gray-500 text-xs mr-2">[Return value]</span>
              <span className="text-purple-400">{result}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeRunner;