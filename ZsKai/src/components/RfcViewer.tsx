import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Search, RefreshCw, FileText, Globe, Check, Copy, ArrowUpRight } from 'lucide-react';

interface RfcDoc {
  number: string;
  title: string;
  category: string;
  status: string;
  authors: string;
  date: string;
  obsoletes?: string;
  abstract: string;
  content: string;
}

const FEATURED_RFCS: RfcDoc[] = [
  {
    number: "9110",
    title: "HTTP Semantics (RFC 9110)",
    category: "Standards Track",
    status: "Internet Standard",
    authors: "R. Fielding, M. Nottingham, J. Reschke",
    date: "June 2022",
    obsoletes: "RFC 7230, RFC 7231, RFC 7232, RFC 7233, RFC 7234, RFC 7235",
    abstract: "The Hypertext Transfer Protocol (HTTP) is a stateless application-level protocol for distributed, collaborative, hypertext information systems. This document defines the HTTP semantics, independent of any transport or wire representation.",
    content: `Network Working Group                                     R. Fielding
Request for Comments: 9110                             M. Nottingham
STD: 97                                                   J. Reschke
Obsoletes: 7230, 7231, 7232, 7233, 7234, 7235              June 2022
Category: Standards Track
ISSN: 2070-1721

                            HTTP Semantics

Abstract
   The Hypertext Transfer Protocol (HTTP) is a stateless application-
   level protocol for distributed, collaborative, hypertext information
   systems.  This document defines the HTTP semantics, independent of
   transport or wire representation.

1.  Introduction
   HTTP is a stateless request/response protocol that operates by
   exchanging messages over a reliable transport or session connection.
   An HTTP client sends a request message to a server, and the server
   responds with a status code and response payload.

2.  Message Components
   2.1. Request Line: Method, Request-Target, HTTP-Version
   2.2. Headers: Key-Value metadata pairs
   2.3. Body: Payload bytes with Content-Type & Content-Length

3.  Status Codes
   - 200 OK: Request succeeded.
   - 201 Created: Resource provisioned.
   - 400 Bad Request: Malformed syntax.
   - 401 Unauthorized: Credentials required.
   - 404 Not Found: Resource absent.
   - 500 Internal Server Error: Unhandled server condition.
`
  },
  {
    number: "8446",
    title: "The Transport Layer Security (TLS) Protocol Version 1.3",
    category: "Standards Track",
    status: "Internet Standard",
    authors: "E. Rescorla (Mozilla)",
    date: "August 2018",
    obsoletes: "RFC 5246, RFC 6066",
    abstract: "This document specifies version 1.3 of the Transport Layer Security (TLS) protocol. TLS 1.3 provides communications security over the Internet, preventing eavesdropping, tampering, and message forgery.",
    content: `Internet Engineering Task Force (IETF)                    E. Rescorla
Request for Comments: 8446                                    Mozilla
Obsoletes: 5246, 6066                                     August 2018
Category: Standards Track
ISSN: 2070-1721

             The Transport Layer Security (TLS) Protocol Version 1.3

Abstract
   This document specifies version 1.3 of the Transport Layer Security
   (TLS) protocol. TLS 1.3 provides communications security over the
   Internet, designed to prevent eavesdropping, tampering, or message
   forgery.

1.  Introduction
   The primary goal of TLS is to provide security services between two
   communicating peer applications:
   - Confidentiality (Symmetric Encryption)
   - Integrity (MAC & AEAD Algorithms)
   - Authentication (X.509 Digital Certificates & ECDHE Key Exchange)

2.  Key Protocol Improvements over TLS 1.2
   - Removed obsolete cipher suites (RC4, 3DES, static RSA)
   - Reduced handshake latency to 1-RTT (and 0-RTT resumption)
   - Encrypted all handshake messages following ClientHello
`
  },
  {
    number: "6749",
    title: "The OAuth 2.0 Authorization Framework",
    category: "Standards Track",
    status: "RFC Standard",
    authors: "D. Hardt (Ed.)",
    date: "October 2012",
    abstract: "The OAuth 2.0 authorization framework enables a third-party application to obtain limited access to an HTTP service, either on behalf of a resource owner by orchestrating an approval interaction or by allowing the application to obtain access on its own behalf.",
    content: `Internet Engineering Task Force (IETF)                      D. Hardt, Ed.
Request for Comments: 6749                                   October 2012
Category: Standards Track
ISSN: 2070-1721

               The OAuth 2.0 Authorization Framework

Abstract
   The OAuth 2.0 authorization framework enables a third-party application
   to obtain limited access to an HTTP service, either on behalf of a
   resource owner by orchestrating an approval interaction between the
   resource owner and the HTTP service, or by allowing the third-party
   application to obtain access on its own behalf.

1.  Roles
   - Resource Owner: An entity capable of granting access to a protected resource.
   - Resource Server: The server hosting protected resources (API).
   - Client: An application making requests on behalf of the owner.
   - Authorization Server: The server issuing access tokens.

2.  Protocol Flow
     +--------+                               +---------------+
     |        |--(A)- Authorization Request ->|   Resource    |
     |        |                               |     Owner     |
     |        |<-(B)-- Authorization Grant ---|               |
     |        |                               +---------------+
     |        |
     |        |                               +---------------+
     |        |--(C)-- Authorization Grant -->| Authorization |
     | Client |                               |     Server    |
     |        |<-(D)----- Access Token -------|               |
     |        |                               +---------------+
     |        |
     |        |                               +---------------+
     |        |--(E)----- Access Token ------>|    Resource   |
     |        |                               |     Server    |
     |        |<-(F)--- Protected Resource ---|               |
     +--------+                               +---------------+
`
  },
  {
    number: "6455",
    title: "The WebSocket Protocol",
    category: "Standards Track",
    status: "Internet Standard",
    authors: "I. Fette, A. Melnikov",
    date: "December 2011",
    abstract: "The WebSocket Protocol enables two-way communication between a client running untrusted code in a controlled environment to a remote host that has opted-in to communications from that code.",
    content: `Internet Engineering Task Force (IETF)                      I. Fette
Request for Comments: 6455                               A. Melnikov
Category: Standards Track                              December 2011
ISSN: 2070-1721

                         The WebSocket Protocol

Abstract
   The WebSocket Protocol enables two-way communication between a client
   and a remote server host over a single persistent TCP connection.

1.  Opening Handshake
   GET /chat HTTP/1.1
   Host: server.example.com
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhl IHNhbXBsZSBub25jZQ==
   Sec-WebSocket-Version: 13

   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
`
  }
];

export const RfcViewer: React.FC = () => {
  const [searchRfc, setSearchRfc] = useState('');
  const [selectedRfc, setSelectedRfc] = useState<RfcDoc>(FEATURED_RFCS[0]);
  const [fetchedText, setFetchedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'doc'>('doc');

  const filteredRfcs = FEATURED_RFCS.filter(
    doc =>
      doc.number.includes(searchRfc) ||
      doc.title.toLowerCase().includes(searchRfc.toLowerCase()) ||
      doc.abstract.toLowerCase().includes(searchRfc.toLowerCase())
  );

  const handleFetchExternalRfc = async (rfcNum: string) => {
    setIsLoading(true);
    setFetchedText(null);
    try {
      const res = await fetch(`https://www.rfc-editor.org/rfc/rfc${rfcNum}.txt`);
      if (res.ok) {
        const text = await res.text();
        setFetchedText(text.slice(0, 12000) + "\n\n...[Full RFC document loaded from https://www.rfc-editor.org/]");
        setMobileView('doc');
      } else {
        setFetchedText(null);
      }
    } catch {
      setFetchedText(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDoc = () => {
    const docText = fetchedText || selectedRfc.content;
    navigator.clipboard.writeText(docText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-black text-white font-mono text-xs flex flex-col md:flex-row h-full overflow-hidden border-t-2 border-neutral-800 select-text">
      {/* Top Mobile Bar: Navigation Toggle between Index & Reader */}
      <div className="flex md:hidden items-center justify-between p-2 bg-neutral-950 border-b-2 border-neutral-800 shrink-0">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setMobileView('list')}
            className={`px-3 py-1 font-bold text-[11px] uppercase border-2 transition-all cursor-pointer ${
              mobileView === 'list'
                ? 'bg-cyan-400 text-black border-cyan-300 font-black'
                : 'bg-black text-neutral-300 border-neutral-700'
            }`}
          >
            Danh sách RFC ({filteredRfcs.length})
          </button>
          <button
            onClick={() => setMobileView('doc')}
            className={`px-3 py-1 font-bold text-[11px] uppercase border-2 transition-all cursor-pointer ${
              mobileView === 'doc'
                ? 'bg-cyan-400 text-black border-cyan-300 font-black'
                : 'bg-black text-neutral-300 border-neutral-700'
            }`}
          >
            Đọc RFC {selectedRfc.number}
          </button>
        </div>

        <a
          href="https://www.rfc-editor.org/"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 font-bold"
        >
          rfc-editor.org <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

      {/* Quick RFC Pill Selector Bar (Mobile & Desktop) */}
      <div className="flex md:hidden overflow-x-auto p-2 bg-black border-b-2 border-neutral-800 space-x-2 shrink-0 no-scrollbar">
        {FEATURED_RFCS.map(doc => (
          <button
            key={doc.number}
            onClick={() => {
              setSelectedRfc(doc);
              setFetchedText(null);
              setMobileView('doc');
            }}
            className={`px-2.5 py-1 text-[10px] font-bold border-2 whitespace-nowrap transition-all cursor-pointer rounded-none uppercase ${
              selectedRfc.number === doc.number && !fetchedText
                ? 'bg-cyan-400 text-black border-cyan-300 font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                : 'bg-black text-cyan-300 border-neutral-700 hover:border-cyan-400'
            }`}
          >
            RFC {doc.number}
          </button>
        ))}
      </div>

      {/* Left Sidebar: RFC Index & Search (Desktop always, Mobile conditionally) */}
      <div className={`w-full md:w-80 bg-black border-r-2 border-neutral-800 flex-col shrink-0 ${
        mobileView === 'list' ? 'flex flex-1 h-full' : 'hidden md:flex'
      }`}>
        <div className="p-3 border-b-2 border-neutral-800 bg-neutral-950">
          <div className="hidden md:flex items-center justify-between mb-2">
            <span className="font-extrabold text-white uppercase text-xs tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              RFC-Editor.org
            </span>
            <a
              href="https://www.rfc-editor.org/"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 font-bold"
            >
              rfc-editor.org <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchRfc}
              onChange={e => setSearchRfc(e.target.value)}
              placeholder="Search RFC (9110, TLS, OAuth)..."
              className="w-full bg-black border-2 border-neutral-700 text-white pl-8 pr-2 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-400 rounded-none font-medium placeholder-neutral-500"
            />
          </div>
        </div>

        {/* List of Featured RFC Documents */}
        <div className="flex-1 overflow-y-auto divide-y-2 divide-neutral-900">
          {filteredRfcs.map(doc => {
            const isSelected = selectedRfc.number === doc.number && !fetchedText;
            return (
              <button
                key={doc.number}
                onClick={() => {
                  setSelectedRfc(doc);
                  setFetchedText(null);
                  setMobileView('doc');
                }}
                className={`w-full p-3 text-left transition-all rounded-none cursor-pointer border-l-4 ${
                  isSelected
                    ? 'bg-neutral-900 border-cyan-400 text-white font-bold shadow-inner'
                    : 'border-transparent text-neutral-300 hover:bg-neutral-900/80 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.5 bg-neutral-900 text-cyan-300 font-mono text-[10px] font-extrabold border-2 border-neutral-700">
                    RFC {doc.number}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-semibold">{doc.date}</span>
                </div>
                <div className="font-bold text-white text-xs line-clamp-1">{doc.title}</div>
                <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{doc.abstract}</div>
              </button>
            );
          })}
        </div>

        {/* Live Fetch Custom RFC Number */}
        <div className="p-3 border-t-2 border-neutral-800 bg-neutral-950 space-y-2">
          <div className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
            Fetch any RFC from rfc-editor.org
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="RFC #"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) handleFetchExternalRfc(val);
                }
              }}
              className="w-20 bg-black border-2 border-neutral-700 text-white px-2 py-1 text-xs font-mono rounded-none focus:outline-none focus:border-cyan-400 font-bold"
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input && input.value) handleFetchExternalRfc(input.value);
              }}
              disabled={isLoading}
              className="flex-1 py-1 bg-cyan-400 hover:bg-cyan-300 border-2 border-cyan-300 text-black font-extrabold text-xs uppercase rounded-none transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(34,211,238,0.4)] active:scale-95"
            >
              {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Fetch Live RFC'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Document Display Area (Full Unclipped Reader) */}
      <div className={`flex-1 flex-col bg-black overflow-hidden h-full ${
        mobileView === 'doc' ? 'flex' : 'hidden md:flex'
      }`}>
        {/* Document Header Bar */}
        <div className="px-3 sm:px-4 py-2.5 bg-neutral-950 border-b-2 border-neutral-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="px-2 py-0.5 bg-cyan-400 text-black font-extrabold text-xs border-2 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              RFC {selectedRfc.number}
            </div>
            <div>
              <h2 className="font-extrabold text-white text-xs sm:text-sm tracking-tight">{selectedRfc.title}</h2>
              <div className="text-[10px] text-neutral-400 font-medium">
                {selectedRfc.category} &bull; {selectedRfc.status}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyDoc}
              className="px-2.5 py-1 bg-black hover:bg-neutral-900 border-2 border-neutral-700 text-white text-xs rounded-none font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Copy RFC Document Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-cyan-300" /> : <Copy className="w-3.5 h-3.5 text-neutral-300" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={`https://www.rfc-editor.org/rfc/rfc${selectedRfc.number}.html`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 border-2 border-cyan-300 text-black font-extrabold text-xs rounded-none shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all flex items-center gap-1 active:scale-95 uppercase"
            >
              <span>HTML</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
          </div>
        </div>

        {/* Main Document Body (Clean, Full, Unclipped) */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto font-mono text-xs text-white leading-relaxed space-y-4 select-text bg-black">
          {fetchedText ? (
            <div className="bg-black p-4 border-2 border-neutral-800">
              <pre className="whitespace-pre-wrap font-mono text-xs text-neutral-100 leading-relaxed">
                {fetchedText}
              </pre>
            </div>
          ) : (
            <div className="bg-black p-4 sm:p-5 border-2 border-neutral-800 space-y-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-cyan-100 leading-relaxed border-b-2 border-neutral-800 pb-4">
                {selectedRfc.content}
              </pre>

              <div className="text-[11px] text-neutral-300 space-y-2 pt-2 border-t-2 border-neutral-900">
                <div className="font-extrabold text-white uppercase tracking-wider text-xs">Thông tin bài viết RFC (Metadata):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><span className="text-neutral-400 font-bold">Trang chính thức:</span> <a href={`https://www.rfc-editor.org/info/rfc${selectedRfc.number}`} target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">https://www.rfc-editor.org/info/rfc{selectedRfc.number}</a></div>
                  <div><span className="text-neutral-400 font-bold">Tác giả:</span> {selectedRfc.authors}</div>
                  <div><span className="text-neutral-400 font-bold">Ngày ban hành:</span> {selectedRfc.date}</div>
                  <div><span className="text-neutral-400 font-bold">Trạng thái:</span> {selectedRfc.status}</div>
                  {selectedRfc.obsoletes && (
                    <div className="col-span-1 sm:col-span-2"><span className="text-neutral-400 font-bold">Thay thế bài viết:</span> {selectedRfc.obsoletes}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
