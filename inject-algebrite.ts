export {};

const algebrite = await Bun.file(
  "node_modules/algebrite/dist/algebrite.bundle-for-browser.js",
).text();

new HTMLRewriter()
  .on('script[type="text/javascript"][src]', {
    element(element) {
      element
        .after(`<script type="text/javascript">${algebrite}</script>`, {
          html: true,
        })
        .after(
          `
<script type="text/javascript">
  function jsstring_to_cs(jsvar, csvar) {
    var com = csvar + ' = "' + eval(jsvar) + '"';
    // alert("jsstring_to_cs: com=" + com);
    cdy.evokeCS(com);
  }

  function js_to_cs(jsvar, csvar) {
    var com = csvar + ' = ' + eval(jsvar);
    // alert("js_to_cs: com=" + com);
    cdy.evokeCS(com);
  }
</script>
        `,
          { html: true },
        );
    },
  })
  .on('script[id="csinit"]', {
    element(element) {
      element.prepend(
        `
jstocs(jsvar, csvar) := (
  com = "js_to_cs('" + jsvar + "','" + csvar +"')";
  // alert("jstcs com="+com);
  javascript(com);
);

jsstringtocs(jsvar, csvar) := (
  com = "jsstring_to_cs('" + jsvar + "','" + csvar +"')";
  javascript(com);
);

cstojs(csvar, jsvar) := (
  // print("csvar=" + csvar + ", jsvar=" + jsvar);
  // print(jsvar + " = " + parse(csvar));
  javascript(jsvar + " = " + parse(csvar));
);

csstringtojs(csvar, jsvar) := (
  javascript(jsvar + " = '" + parse(csvar) + "'");
  // javascript(jsvar + " = " + csvar);
);

exejs(argmentcom) := (
  javascript(argmentcom)
);

execs(argmentcom) := (
  parse(argmentcom);
);

exealg(com) := (
  regional(exealtmp2);
  exejs("exealtmp1=Algebrite.run('"+com+"')");
  jsstringtocs("exealtmp1", "exealtmp2");
  exealtmp2;
);

alert(str) := (
  javascript("alert('"+str+"')");
);
        `.trim(),
      );
    },
  })
  .transform(new Response(Bun.stdin))
  .arrayBuffer()
  .then((buffer) => process.stdout.write(buffer));
