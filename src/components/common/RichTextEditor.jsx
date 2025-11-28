"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Enter your content here...",
  disabled = false,
  height = "300px",
  className = "",
  onImageUpload,
}) => {
  const fileInputRef = useRef(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          options: [
            { level: 1, HTMLAttributes: { class: "text-3xl font-bold" } },
            { level: 2, HTMLAttributes: { class: "text-2xl font-bold" } },
            { level: 3, HTMLAttributes: { class: "text-xl font-semibold" } },
          ],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.width) {
                  return {};
                }
                // Ensure width is rendered as a string with 'px' if it's a number
                const widthValue = typeof attributes.width === 'number' 
                  ? `${attributes.width}px` 
                  : (typeof attributes.width === 'string' && !attributes.width.includes('px'))
                    ? `${attributes.width}px`
                    : attributes.width;
                return {
                  width: widthValue,
                  style: `width: ${widthValue}; max-width: 100%; height: auto;`,
                };
              },
              parseHTML: element => {
                // Try to get width from style attribute first, then from width attribute
                const styleAttr = element.getAttribute('style');
                if (styleAttr) {
                  // Match width in style: "width: 300px;" or "width:300px;"
                  const widthMatch = styleAttr.match(/width\s*:\s*(\d+(?:\.\d+)?)\s*px/i);
                  if (widthMatch && widthMatch[1]) {
                    const numValue = parseInt(widthMatch[1]);
                    if (!isNaN(numValue) && numValue > 0) {
                      return numValue;
                    }
                  }
                }
                // Fallback to width attribute
                const widthAttr = element.getAttribute('width');
                if (widthAttr) {
                  // Remove 'px' if present and return as number
                  const numValue = parseInt(widthAttr.replace('px', '').trim());
                  if (!isNaN(numValue) && numValue > 0) {
                    return numValue;
                  }
                }
                return null;
              },
            },
            height: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.height) {
                  return {};
                }
                return {
                  height: attributes.height,
                };
              },
              parseHTML: element => element.getAttribute('height'),
            },
            align: {
              default: 'center',
              renderHTML: attributes => {
                if (!attributes.align) {
                  return {};
                }
                return {
                  'data-align': attributes.align,
                  style: `float: ${attributes.align === 'left' ? 'left' : attributes.align === 'right' ? 'right' : 'none'}; ${attributes.align === 'center' ? 'display: block; margin-left: auto; margin-right: auto;' : ''}`,
                };
              },
              parseHTML: element => {
                const dataAlign = element.getAttribute('data-align');
                if (dataAlign) return dataAlign;
                const style = element.getAttribute('style') || '';
                if (style.includes('float: left') || style.includes('float:left')) return 'left';
                if (style.includes('float: right') || style.includes('float:right')) return 'right';
                return 'center';
              },
            },
          };
        },
        addNodeView() {
          return ({ node, HTMLAttributes, getPos, editor }) => {
            const dom = document.createElement('div');
            dom.className = 'image-wrapper';
            
            const img = document.createElement('img');
            Object.entries(HTMLAttributes).forEach(([key, value]) => {
              img.setAttribute(key, value);
            });
            img.src = node.attrs.src;
            
            // Set initial size - prefer width only to maintain aspect ratio
            // IMPORTANT: Preserve width from attributes to prevent reset on alignment change
            if (node.attrs.width) {
              const widthValue = typeof node.attrs.width === 'string' 
                ? parseInt(node.attrs.width.replace('px', '')) 
                : parseInt(node.attrs.width);
              if (!isNaN(widthValue) && widthValue > 0) {
                img.style.width = `${widthValue}px`;
                img.style.height = 'auto'; // Let browser calculate height to prevent compression
              } else {
                img.style.width = 'auto';
                img.style.height = 'auto';
              }
            } else if (node.attrs.height) {
              // If only height is set, we'll need to calculate width
              // But prefer to use width for better control
              const heightValue = typeof node.attrs.height === 'string' 
                ? parseInt(node.attrs.height.replace('px', '')) 
                : parseInt(node.attrs.height);
              if (!isNaN(heightValue) && heightValue > 0) {
                img.style.height = `${heightValue}px`;
                img.style.width = 'auto';
              } else {
                img.style.width = 'auto';
                img.style.height = 'auto';
              }
            } else {
              img.style.width = 'auto';
              img.style.height = 'auto';
            }
            
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.margin = '0'; // No margin on image itself, wrapper handles spacing
            img.style.cursor = 'pointer';
            // Don't use object-fit: contain as it can cause compression
            // Instead, let height be auto to maintain natural aspect ratio
            
            // Add resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'image-resize-handle';
            resizeHandle.innerHTML = '↘';
            resizeHandle.style.cssText = `
              position: absolute;
              bottom: 0;
              right: 0;
              width: 20px;
              height: 20px;
              background: #3b82f6;
              border: 2px solid white;
              border-radius: 4px;
              cursor: nwse-resize;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              z-index: 10;
            `;
            
            // Set alignment
            const align = node.attrs.align || 'center';
            dom.setAttribute('data-align', align);
            
            // Wrapper should tightly wrap the image, not be full width
            dom.style.position = 'relative';
            dom.style.display = 'inline-block';
            dom.style.maxWidth = '100%';
            // Use width from image if set, otherwise fit-content
            // We'll set this after image loads to ensure accurate sizing
            dom.style.width = 'fit-content'; // Will be updated after image loads
            dom.style.height = 'fit-content';
            
            // Function to update wrapper width to match image
            const updateWrapperWidth = () => {
              if (img.offsetWidth > 0) {
                dom.style.width = `${img.offsetWidth}px`;
              } else if (node.attrs.width) {
                const widthValue = typeof node.attrs.width === 'string' 
                  ? parseInt(node.attrs.width.replace('px', '')) 
                  : node.attrs.width;
                if (!isNaN(widthValue) && widthValue > 0) {
                  dom.style.width = `${widthValue}px`;
                }
              }
            };
            
            // Update wrapper width when image loads
            if (img.complete) {
              updateWrapperWidth();
            } else {
              img.addEventListener('load', updateWrapperWidth);
            }
            
            // Remove any margins from image that might affect wrapper size
            img.style.margin = '0';
            img.style.display = 'block';
            
            // Apply alignment to wrapper using float or margin auto
            // IMPORTANT: Alignment should only affect positioning, not the wrapper size
            if (align === 'left') {
              dom.style.float = 'left';
              dom.style.marginRight = '1rem';
              dom.style.marginLeft = '0';
              dom.style.clear = 'left';
            } else if (align === 'right') {
              dom.style.float = 'right';
              dom.style.marginLeft = '1rem';
              dom.style.marginRight = '0';
              dom.style.clear = 'right';
            } else {
              // Center: use margin auto with block display
              dom.style.float = 'none';
              dom.style.display = 'block';
              dom.style.marginLeft = 'auto';
              dom.style.marginRight = 'auto';
              dom.style.clear = 'both';
            }
            
            dom.appendChild(img);
            
            if (!editor.isEditable) {
              return { dom };
            }
            
            dom.appendChild(resizeHandle);
            
            let isResizing = false;
            let startX, startY, startWidth, startHeight;
            
            const startResize = (e) => {
              e.preventDefault();
              e.stopPropagation();
              isResizing = true;
              startX = e.clientX;
              startY = e.clientY;
              const rect = img.getBoundingClientRect();
              startWidth = rect.width;
              startHeight = rect.height;
              
              document.addEventListener('mousemove', doResize);
              document.addEventListener('mouseup', stopResize);
            };
            
            let naturalAspectRatio = 1;
            
            // Get natural aspect ratio when image loads
            const updateAspectRatio = () => {
              if (img.naturalWidth && img.naturalHeight) {
                naturalAspectRatio = img.naturalWidth / img.naturalHeight;
              }
            };
            
            if (img.complete) {
              updateAspectRatio();
            } else {
              img.addEventListener('load', updateAspectRatio);
            }
            
            const doResize = (e) => {
              if (!isResizing) return;
              
              const deltaX = e.clientX - startX;
              const deltaY = e.clientY - startY;
              
              // Use diagonal distance for more natural resizing
              const delta = (deltaX + deltaY) / 2;
              
              // Calculate new width maintaining aspect ratio
              const newWidth = Math.max(50, startWidth + delta);
              const newHeight = newWidth / naturalAspectRatio;
              
              // Only set width, let height be calculated automatically to prevent compression
              img.style.width = `${newWidth}px`;
              img.style.height = 'auto'; // Let CSS maintain aspect ratio
              
              // Update wrapper width to match image width
              dom.style.width = `${newWidth}px`;
              
              if (typeof getPos === 'function') {
                const pos = getPos();
                if (pos !== undefined) {
                  // Store width as numeric value (without 'px') to maintain aspect ratio
                  // Also preserve alignment when resizing
                  const currentAlign = node.attrs.align || 'center';
                  editor.commands.updateAttributes('image', {
                    width: newWidth, // Store as number, not string with 'px'
                    height: null, // Remove height to prevent compression
                    align: currentAlign, // Preserve alignment
                  });
                }
              }
            };
            
            const stopResize = () => {
              if (isResizing) {
                // Ensure final width is saved when resize ends
                const finalWidth = parseInt(img.style.width) || img.offsetWidth;
                if (finalWidth > 0 && typeof getPos === 'function') {
                  const pos = getPos();
                  if (pos !== undefined) {
                    const currentAlign = node.attrs.align || 'center';
                    editor.commands.updateAttributes('image', {
                      width: finalWidth,
                      height: null,
                      align: currentAlign,
                    });
                  }
                }
              }
              isResizing = false;
              document.removeEventListener('mousemove', doResize);
              document.removeEventListener('mouseup', stopResize);
            };
            
            resizeHandle.addEventListener('mousedown', startResize);
            
            // Add alignment controls for images
            const alignmentControls = document.createElement('div');
            alignmentControls.className = 'image-alignment-controls';
            alignmentControls.style.cssText = `
              position: absolute;
              top: -35px;
              left: 50%;
              transform: translateX(-50%);
              display: none;
              flex;
              gap: 4px;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 4px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              z-index: 20;
            `;
            
            const alignButtons = [
              { value: 'left', icon: '⬅', title: 'Align Left' },
              { value: 'center', icon: '⬌', title: 'Align Center' },
              { value: 'right', icon: '➡', title: 'Align Right' },
            ];
            
            alignButtons.forEach(({ value, icon, title }) => {
              const btn = document.createElement('button');
              btn.innerHTML = icon;
              btn.title = title;
              btn.style.cssText = `
                width: 28px;
                height: 28px;
                border: none;
                background: ${align === value ? '#3b82f6' : 'transparent'};
                color: ${align === value ? 'white' : '#6b7280'};
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s;
              `;
              btn.addEventListener('mouseenter', () => {
                if (align !== value) {
                  btn.style.background = '#f3f4f6';
                }
              });
              btn.addEventListener('mouseleave', () => {
                if (align !== value) {
                  btn.style.background = 'transparent';
                }
              });
              btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof getPos === 'function') {
                  const pos = getPos();
                  if (pos !== undefined) {
                    // Preserve width when changing alignment - get actual computed width
                    // Priority: inline style > node attribute > computed width
                    let currentWidth = null;
                    
                    // First try inline style
                    if (img.style.width && img.style.width !== 'auto' && img.style.width !== '') {
                      currentWidth = img.style.width;
                    }
                    // Then try node attribute
                    else if (node.attrs.width) {
                      currentWidth = node.attrs.width;
                    }
                    // Finally try computed width from DOM
                    else if (img.offsetWidth && img.offsetWidth > 0) {
                      currentWidth = img.offsetWidth;
                    }
                    
                    // Get current attributes to preserve all properties
                    const currentAttrs = { ...node.attrs };
                    
                    // Extract numeric value if it's a string like "300px"
                    let widthValue = null;
                    if (currentWidth) {
                      if (typeof currentWidth === 'string') {
                        const numValue = parseInt(currentWidth.replace('px', '').trim());
                        if (!isNaN(numValue) && numValue > 0) {
                          widthValue = numValue;
                        }
                      } else if (typeof currentWidth === 'number' && currentWidth > 0) {
                        widthValue = currentWidth;
                      }
                    }
                    
                    // Update attributes preserving width
                    const updateAttrs = {
                      align: value,
                      height: currentAttrs.height || null
                    };
                    
                    if (widthValue) {
                      updateAttrs.width = widthValue;
                    } else if (currentAttrs.width) {
                      updateAttrs.width = currentAttrs.width;
                    }
                    
                    editor.commands.updateAttributes('image', updateAttrs);
                  }
                }
              });
              alignmentControls.appendChild(btn);
            });
            
            dom.appendChild(alignmentControls);
            
            // Show/hide alignment controls on hover
            let controlsTimeout;
            dom.addEventListener('mouseenter', () => {
              clearTimeout(controlsTimeout);
              alignmentControls.style.display = 'flex';
            });
            dom.addEventListener('mouseleave', () => {
              controlsTimeout = setTimeout(() => {
                alignmentControls.style.display = 'none';
              }, 200);
            });
            
            img.addEventListener('click', (e) => {
              e.preventDefault();
              if (typeof getPos === 'function') {
                const pos = getPos();
                if (pos !== undefined) {
                  editor.commands.setNodeSelection(pos);
                }
              }
            });
            
            return { dom };
          };
        },
      }).configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[${height}] p-4`,
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = useCallback(async (file) => {
    if (!editor || !file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      let imageUrl;

      // If onImageUpload callback is provided, use it to upload to server
      if (onImageUpload) {
        imageUrl = await onImageUpload(file);
      } else {
        // Otherwise, use base64 (for immediate preview, but not recommended for production)
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // Insert image at current cursor position
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, [editor, onImageUpload]);

  const handleImageButtonClick = useCallback(() => {
    if (disabled || !editor) return;
    fileInputRef.current?.click();
  }, [disabled, editor]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleImageUpload]);

  if (!editor) {
    return (
      <div
        className={`border border-gray-300 rounded-lg p-8 text-center ${className}`}
        style={{ minHeight: height }}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
        <p className="text-sm text-gray-600 mt-4">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-50 flex items-center gap-2 p-2 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
            className={`px-2 py-1 rounded text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive("bold") ? "bg-gray-300" : ""
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
            className={`px-2 py-1 rounded text-sm italic hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive("italic") ? "bg-gray-300" : ""
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled}
            className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive("underline") ? "bg-gray-300" : ""
            }`}
            title="Underline"
          >
            U
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            disabled={disabled}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            value={
              editor.isActive("heading", { level: 1 })
                ? 1
                : editor.isActive("heading", { level: 2 })
                ? 2
                : editor.isActive("heading", { level: 3 })
                ? 3
                : 0
            }
          >
            <option value={0}>Paragraph</option>
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive("bulletList") ? "bg-gray-300" : ""
            }`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive("orderedList") ? "bg-gray-300" : ""
            }`}
            title="Numbered List"
          >
            1.
          </button>
        </div>

        {/* Other */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive("blockquote") ? "bg-gray-300" : ""
            }`}
            title="Quote"
          >
            "
          </button>
          <button
            type="button"
            onClick={setLink}
            disabled={disabled}
            className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive("link") ? "bg-gray-300" : ""
            }`}
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={disabled}
            className="px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Insert Image"
          >
            🖼️
          </button>
          
          {/* Text Alignment */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              disabled={disabled}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                editor.isActive({ textAlign: 'left' }) ? "bg-gray-300" : ""
              }`}
              title="Align Left"
            >
              ⬅
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              disabled={disabled}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                editor.isActive({ textAlign: 'center' }) ? "bg-gray-300" : ""
              }`}
              title="Align Center"
            >
              ⬌
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              disabled={disabled}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                editor.isActive({ textAlign: 'right' }) ? "bg-gray-300" : ""
              }`}
              title="Align Right"
            >
              ➡
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              disabled={disabled}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                editor.isActive({ textAlign: 'justify' }) ? "bg-gray-300" : ""
              }`}
              title="Justify"
            >
              ⬌⬌
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run() || disabled}
            className="px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run() || disabled}
            className="px-2 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        className="border-x border-b border-gray-300 rounded-b-lg bg-white"
        style={{ minHeight: height }}
      >
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .rich-text-editor-wrapper .ProseMirror {
          min-height: ${height};
          outline: none;
          padding: 1rem;
        }
        .rich-text-editor-wrapper .ProseMirror:focus {
          outline: none;
        }
        .rich-text-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .rich-text-editor-wrapper .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor-wrapper .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor-wrapper .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor-wrapper .ProseMirror ul,
        .rich-text-editor-wrapper .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .rich-text-editor-wrapper .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
        .rich-text-editor-wrapper .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        .rich-text-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
        }
        .rich-text-editor-wrapper .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper {
          position: relative;
          display: inline-block;
          max-width: 100%;
          width: fit-content;
          height: fit-content;
          margin: 1rem 0;
          clear: both;
          box-sizing: border-box;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper[data-align="left"] {
          float: left;
          margin-right: 1rem;
          margin-left: 0;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper[data-align="right"] {
          float: right;
          margin-left: 1rem;
          margin-right: 0;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper[data-align="center"] {
          float: none;
          display: block;
          margin-left: auto;
          margin-right: auto;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper img {
          display: block;
          max-width: 100%;
          height: auto !important; /* Force auto height to prevent compression */
          margin: 0 !important; /* Remove margins from image itself */
          width: auto; /* Let inline style control width */
          box-sizing: border-box;
          /* Don't set width: 100% as it will override the resized width */
        }
        .rich-text-editor-wrapper .ProseMirror .image-resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 4px;
          cursor: nwse-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .rich-text-editor-wrapper .ProseMirror .image-resize-handle:hover {
          background: #2563eb;
        }
        .rich-text-editor-wrapper .ProseMirror .image-alignment-controls {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper:hover .image-alignment-controls {
          opacity: 1;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper[data-align="left"] {
          text-align: left;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper[data-align="center"] {
          text-align: center;
        }
        .rich-text-editor-wrapper .ProseMirror .image-wrapper[data-align="right"] {
          text-align: right;
        }
        .rich-text-editor-wrapper .ProseMirror [style*="text-align: left"] {
          text-align: left !important;
        }
        .rich-text-editor-wrapper .ProseMirror [style*="text-align: center"] {
          text-align: center !important;
        }
        .rich-text-editor-wrapper .ProseMirror [style*="text-align: right"] {
          text-align: right !important;
        }
        .rich-text-editor-wrapper .ProseMirror [style*="text-align: justify"] {
          text-align: justify !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
