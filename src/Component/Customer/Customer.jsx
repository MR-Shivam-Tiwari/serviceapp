import React from "react";
import { useNavigate } from "react-router-dom";

function Customer() {
  const navigate = useNavigate();
  return (
    <div>
      {" "}
      <div className=" ">
        <div className="w-full  ">
          <div className="flex items-center bg-primary p-3 py-5 text-white mb-4  ">
            <button className="mr-2 text-white" onClick={() => navigate("/")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                fill="currentColor"
                className="bi bi-arrow-left-short"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold">Customer</h2>
          </div>

          <div className="space-y-4 px-4">
            <button
              onClick={() => navigate("/searchcustomer")}
              className="flex items-center justify-center  w-full px-4 py-6 text-blue-600 bg-white-200 rounded-lg shadow-lg border hover:bg-blue-100"
            >
              <div className="flex flex-col justify-center text-2xl font-bold gap-5 items-center">
                <svg
                  id="fi_13905263"
                  viewBox="0 0 512 512"
                  className="h-16 w-16"
                  xmlns="http://www.w3.org/2000/svg"
                  data-name="Layer 1"
                >
                  <g fill="#ffc107">
                    <path
                      d="m339.992 367.66h76.166v20.827h-76.166z"
                      transform="matrix(.707 -.707 .707 .707 -156.603 377.971)"
                    ></path>
                    <path
                      d="m196.848 168.863a48.1 48.1 0 1 1 48.1-48.1 48.155 48.155 0 0 1 -48.1 48.1z"
                      fill-rule="evenodd"
                    ></path>
                    <path
                      d="m99.149 282.664c-.048-1.342-.077-2.683-.077-4.025a97.779 97.779 0 1 1 195.557 0q0 2.016-.082 4.031l-.056 1.434-1.376.406c-30.929 9.121-64.065 13.158-96.267 13.158s-65.335-4.038-96.266-13.158l-1.382-.41z"
                      fill-rule="evenodd"
                    ></path>
                  </g>
                  <path
                    d="m292.549 282.592c-29.048 8.566-62 13.076-95.7 13.076s-66.648-4.51-95.7-13.076c-.048-1.325-.076-2.641-.076-3.953a95.779 95.779 0 1 1 191.557 0q0 1.968-.08 3.953zm-141.8-161.83a46.1 46.1 0 1 1 46.1 46.1 46.15 46.15 0 0 1 -46.1-46.1zm80.651 51.568a62.1 62.1 0 1 0 -69.1 0 111.979 111.979 0 0 0 -77.228 106.309c0 3.58.169 7.2.509 10.76a8.018 8.018 0 0 0 5.547 6.863c31.822 10.076 68.384 15.406 105.72 15.406s73.9-5.33 105.72-15.406a8.014 8.014 0 0 0 5.552-6.863c.34-3.557.51-7.18.51-10.76a111.979 111.979 0 0 0 -77.23-106.309zm254.088 313.159a36.136 36.136 0 0 1 -51.029 0l-64.63-64.638 51.021-51.021 64.638 64.629a36.2 36.2 0 0 1 0 51.03zm-87.847-138.881-51.029 51.03 11.9 11.9 51.03-51.03-11.9-11.9zm-76.709 3.071 25.5 25.5 28.742-28.742-25.5-25.51a199.738 199.738 0 0 1 -28.751 28.751zm-251.96-24.949c70.507 70.512 185.246 70.512 255.757 0s70.511-185.25 0-255.761-185.25-70.507-255.757 0-70.511 185.25 0 255.761zm334.316 4.91a8 8 0 0 0 -11.307 0l-5.481 5.477-27.161-27.147c52.44-76.61 44.68-182.339-23.3-250.308-76.752-76.752-201.629-76.752-278.381 0s-76.747 201.628 0 278.375a197.148 197.148 0 0 0 250.309 23.3l27.154 27.163-5.481 5.476a8.009 8.009 0 0 0 0 11.312l93.511 93.512a52.082 52.082 0 0 0 73.658-73.653z"
                    fill-rule="evenodd"
                  ></path>
                </svg>
                Search Customer
              </div>
            </button>

            <button
              onClick={() => navigate("/addnewcustomer")}
              className="flex items-center justify-center  w-full px-4 py-6 text-blue-600 bg-white-200 rounded-lg shadow-lg border hover:bg-blue-100"
            >
              <div className="flex flex-col justify-center text-2xl font-bold gap-5 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  width="512"
                  height="512"
                  x="0"
                  y="0"
                  viewBox="0 0 512 512"
                  className="h-14 w-14"
                >
                  <g>
                    <path
                      d="M206.3 247c-60.2 0-109-48.8-109-109s48.8-109 109-109 109 48.8 109 109c-.1 60.2-48.8 108.9-109 109z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                      class=""
                    ></path>
                    <path
                      fill="#ffc107"
                      d="M107.3 138c0-54.7 44.3-99 99-99s99 44.3 99 99-44.3 99-99 99c-54.7-.1-98.9-44.4-99-99z"
                      opacity="1"
                      data-original="#ff4b05"
                      class=""
                    ></path>
                    <path
                      d="M41.2 483C18.5 483 0 464.6 0 441.8 0 340 82.9 257 184.8 257h43.1c101.9 0 184.7 82.9 184.7 184.8 0 22.8-18.5 41.2-41.2 41.2z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                      class=""
                    ></path>
                    <path
                      fill="#ffc107"
                      d="M402.6 441.8c0 17.3-14 31.2-31.2 31.2H41.2C24 473 10 459 10 441.8 10 345.4 88.4 267 184.8 267h43.1c96.3 0 174.7 78.4 174.7 174.8z"
                      opacity="1"
                      data-original="#ff4b05"
                      class=""
                    ></path>
                    <path
                      d="M405.6 331.4c-22.8 0-41.2-18.5-41.2-41.2v-23.9h-23.9c-22.8.4-41.5-17.8-41.9-40.6s17.8-41.5 40.6-41.9h25.2v-23.9c0-22.8 18.5-41.2 41.2-41.2s41.2 18.5 41.2 41.2v23.9h23.9c22.8-.4 41.5 17.8 41.9 40.6s-17.8 41.5-40.6 41.9h-25.2v23.9c0 22.7-18.4 41.2-41.2 41.2z"
                      fill="#000000"
                      opacity="1"
                      data-original="#000000"
                      class=""
                    ></path>
                    <path
                      fill="#ffc107"
                      d="M470.8 193.7h-33.9v-33.9c0-17.3-14-31.2-31.2-31.2s-31.2 14-31.2 31.2v33.9h-33.9c-17.3-.3-31.5 13.4-31.8 30.7s13.4 31.5 30.7 31.8h35v33.9c0 17.3 14 31.2 31.2 31.2s31.2-14 31.2-31.2v-33.9h33.9c17.3.3 31.5-13.4 31.8-30.7s-13.4-31.5-30.7-31.8h-1.1z"
                      opacity="1"
                      data-original="#ff4b05"
                      class=""
                    ></path>
                  </g>
                </svg>
                Add New Customer
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customer;
