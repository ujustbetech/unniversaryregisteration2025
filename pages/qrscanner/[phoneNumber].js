import React, { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
import { useRouter } from "next/router";
import Head from "next/head";
import { db } from "../../firebaseConfig"; // Firebase config file
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "../../pages/event.css"

const QRScanner = () => {
  const router = useRouter();
  const { phoneNumber } = router.query; // Fetch phone number from route
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const qrRef = useRef(null);

  const handleScan = async (result, error) => {
    if (!!result) {
      // Stop the scanner
      if (qrRef.current) qrRef.current.stop();

      try {
        // Fetch user's Firestore document
        const userRef = doc(db, "registerations", phoneNumber);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // Update user's document to mark attendance
          await updateDoc(userRef, {
            attendance: true,
            attendanceTime: new Date().toISOString(),
          });
          setMessage("Attendance marked successfully! Thank you.");
        } else {
          setMessage("User not found in the database. Attendance could not be marked.");
        }
      } catch (err) {
        console.error("Error marking attendance:", err);
        setMessage("An error occurred while marking your attendance. Please try again.");
      } finally {
        setShowModal(true); // Show success/error message
      }
    }

    if (!!error) {
      console.error("Error during scanning:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (qrRef.current) qrRef.current.start(); // Restart scanner after closing modal
  };

  return (
    <>
      <Head>
        <title>QR Scanner</title>
        <meta name="description" content="Mark attendance using a QR code scanner." />
      </Head>
      <main >
        <div className="">
          <h1 className="text-4xl font-bold mb-4">QR Scanner</h1>
          <div className="qrCode-container">
            <QrReader
              className="lg:h-[400px] lg:w-[400px] h-[300px] w-[300px]"
              onResult={handleScan}
              constraints={{ facingMode: "environment" }}
              style={{ width: "40%", height: "40%" }}
              ref={qrRef}
            />
          </div>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white rounded-md p-4">
                <p className="text-xl font-bold mb-2">QR Scan Result</p>
                <p className="text-green-500 mt-4">{message}</p>
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mt-4 hover:bg-gray-300"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default QRScanner;
