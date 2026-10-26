import{_ as c}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-CkS-Mu68.js";import{_ as u}from"./slidev/VClicks-CXYekW_U.js";import{o as d,b as m,w as l,g as s,d as a,m as f,ac as n,v as _,x as v,C as i}from"./modules/vue-4qLiO5vO.js";import{I as g}from"./slidev/default-C5rpscaq.js";import{u as k,f as h}from"./slidev/context-B7cDKouU.js";import"./modules/unplugin-icons-t5Id9QmS.js";import"./index-CaDqzQg3.js";import"./modules/shiki-CFaIC49_.js";const x={class:"cols col-2-3"},M={__name:"slides.md__slidev_24",setup(y){const{$clicksContext:t,$frontmatter:o}=k();return t.setup(),(I,e)=>{const r=u,p=c;return d(),m(g,_(v(i(h)(i(o),23))),{default:l(()=>[e[2]||(e[2]=s("h1",null,"Server-side mail rules, in standard Sieve.",-1)),s("div",x,[s("div",null,[a(r,null,{default:l(()=>[...e[0]||(e[0]=[s("ul",null,[s("li",null,"Every IANA-registered Sieve extension."),s("li",null,"Users edit their own scripts via ManageSieve or JMAP."),s("li",null,"Trusted scripts run at SMTP stages with elevated permissions.")],-1)])]),_:1})]),s("div",null,[a(p,f({},{ranges:["1","3-6","8-12","14-15","all"]}),{default:l(()=>[...e[1]||(e[1]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-text"},[s("span",{class:"line"},[s("span",null,'require ["fileinto", "imap4flags", "vacation", "envelope"];')]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,'if header :contains "List-Id" "@" {')]),n(`
`),s("span",{class:"line"},[s("span",null,'  fileinto "INBOX/Newsletters";')]),n(`
`),s("span",{class:"line"},[s("span",null,"  stop;")]),n(`
`),s("span",{class:"line"},[s("span",null,"}")]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,'if envelope :is "from" "alerts@monitoring.example.com" {')]),n(`
`),s("span",{class:"line"},[s("span",null,'  addflag "\\\\Flagged";')]),n(`
`),s("span",{class:"line"},[s("span",null,'  fileinto "INBOX/Alerts";')]),n(`
`),s("span",{class:"line"},[s("span",null,"  stop;")]),n(`
`),s("span",{class:"line"},[s("span",null,"}")]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,"vacation :days 7")]),n(`
`),s("span",{class:"line"},[s("span",null,'  "I am away until Monday. Will reply on return.";')])])],-1)])]),_:1},16)])])]),_:1},16)}}};export{M as default};
