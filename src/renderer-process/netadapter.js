const { spawn } = require("child_process");
const jschardet = require("jschardet");
const iconv = require("iconv-lite");

const link = document.querySelector("#import_netadapter");
const template = link.import.querySelector(".netadapter-template");
const clone = document.importNode(template.content, true);

const netAdapterList = clone.getElementById("netadapter-list");
const speedDuplex = clone.getElementById("speed-duplex");
const speedDuplexSelect = clone.getElementById("speed-duplex-select");
const speedDuplexBtn = clone.getElementById("speed-duplex-btn");

speedDuplexBtn.addEventListener("click", (event) => changeSpeedDuplex());

const getNetAdapter = spawn("powershell", ["Get-NetAdapter", "| Select Name, InterfaceDescription"]);

let info = "";

getNetAdapter.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
  const encoding = jschardet.detect(data);
  const data_decode = iconv.decode(data, encoding.encoding);

  info += data_decode;
});

getNetAdapter.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

getNetAdapter.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
  if (code === 0) {
    // noerror.
    let test = info
      .split("\r\n")
      .filter((value) => value !== "")
      .map((value) =>
        value
          .trim()
          .split(/^(\S+)\s+(.+)/)
          .filter((value) => value !== "")
      );

    netAdapterList.addEventListener("change", (event) => getNetAdapterInfo(event.target.value));

    const option = document.createElement("option");
    const text = document.createTextNode(`네트워크 어댑터 선택`);
    option.appendChild(text);
    option.setAttribute("value", "");
    netAdapterList.appendChild(option);

    test.forEach((item, index) => {
      // if (item[0] === "이더넷") {
      //   setAdapter(item[0]);
      // }
      if (index > 1) {
        const option = document.createElement("option");
        const text = document.createTextNode(`${item[0]} - ${item[1]}`);
        option.appendChild(text);
        option.setAttribute("value", item[0]);
        netAdapterList.appendChild(option);
      }
    });

    document.querySelector("#netadapter-list").appendChild(clone);
  }
});

/**
 * Auto Negotiation / 자동 협상
 * 1.0 Gbps Full Duplex / 1.0 Gbps 전이중
 * 10 Mbps Full Duplex / 10 Mbps 전이중
 * 10 Mbps Half Duplex / 10 Mbps 반이중
 * 100 Mbps Full Duplex / 100 Mbps 전이중
 * 100 Mbps Half Duplex / 100 Mbps 반이중
 */

const setAdapter = (name, speedDuplex) => {
  console.log(`Set-NetAdapterAdvancedProperty -name '${name}' -DisplayName '속도 및 이중' -DisplayValue '${speedDuplex}'`);
  const setNetAdapter = spawn("powershell", ["Set-NetAdapterAdvancedProperty", `-name '${name}' -DisplayName '속도 및 이중' -DisplayValue '${speedDuplex}'`]);

  setNetAdapter.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  setNetAdapter.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  setNetAdapter.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      getNetAdapterInfo(name);
    }
  });
};

const getNetAdapterInfo = (name) => {
  if (name !== "") {
    const child = spawn("powershell", ["Get-NetAdapterAdvancedProperty", `-name '${name}' -DisplayName '속도 및 이중' | Select DisplayValue`]);

    let childData = "";

    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      const encoding = jschardet.detect(data);
      console.log(encoding);
      const data_decode = iconv.decode(data, "euc-kr");

      childData += data_decode;
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        // noerror.
        info = childData
          .split("\r\n")
          .map((value) => value.trim())
          .filter((value) => value !== "");
        speedDuplex.innerHTML = info[2];
        speedDuplexSelect.value = info[2];
        speedDuplexSelect.style.display = "flex";
        speedDuplexBtn.style.display = "flex";
      }
    });
  }
};

const changeSpeedDuplex = () => {
  console.log(netAdapterList.value);
  if (netAdapterList.value !== "") {
    if (speedDuplexSelect.value !== "") {
      setAdapter(netAdapterList.value, speedDuplexSelect.value);
    }
  }
};
