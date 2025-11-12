import React from 'react';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// A simple markdown to HTML converter for specific syntax used by the AI.
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    // Process block elements (headers) first, ensuring they are on their own lines.
    const withHeaders = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');

    // Process inline elements (bold).
    const withBold = withHeaders.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Finally, handle newlines that are not part of the header replacement.
    const withLineBreaks = withBold.replace(/\n/g, '<br />');

    // Clean up potential double line breaks that might occur around block elements.
    const finalHtml = withLineBreaks
        .replace(/<br \s*\/?><h3>/g, '<h3>')
        .replace(/<\/h3><br \s*\/?>/g, '</h3>');

    return <div className={className} dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};

export default MarkdownRenderer;
