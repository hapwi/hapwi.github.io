import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faCalendarAlt,
  faGolfBall,
  faExclamationTriangle,
  faListOl,
  faExclamationCircle,
  faCreditCard,
  faClock,
  faUsers,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

const Autocomplete = ({ options, value, onChange, error }) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
    setDropdownVisible(true);
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setDropdownVisible(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className={`w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 ${
          error ? "ring-red-500" : "focus:ring-emerald-400"
        } border ${error ? "border-red-500" : "border-gray-600"}`}
      />
      {isDropdownVisible && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className="p-2 cursor-pointer hover:bg-gray-600 text-white"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Form = () => {
  const [availableGolfers, setAvailableGolfers] = useState([]);
  const [topGolfers, setTopGolfers] = useState([]);
  const [isSubmissionClosed, setIsSubmissionClosed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm();

  useEffect(() => {
    const apiKey = "AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc";
    const spreadsheetId = "1zCKMy2jgG9QoIhxFqRviDm4oxEFK_ixv_tN66GmCXTc";
    const range = "Sheet1!A:A";

    const fetchGolfers = async () => {
      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );
        const golfers = response.data.values.flat();
        setAvailableGolfers(golfers);

        setTopGolfers([
          { name: "Scottie Scheffler", odds: "+300" },
          { name: "Xander Schauffele", odds: "+1000" },
          { name: "Rory McIlroy", odds: "+1100" },
          { name: "Collin Morikawa", odds: "+1600" },
          { name: "Viktor Hovland", odds: "+2000" },
          { name: "Bryson DeChambeau", odds: "+2000" },
          { name: "Ludvig Åberg", odds: "+2000" },
          { name: "Brooks Koepka", odds: "+2200" },
          { name: "Hideki Matsuyama", odds: "+3500" },
          { name: "Tommy Fleetwood", odds: "+4000" },
        ]);
      } catch (error) {
        console.error("Error fetching golfers:", error);
      }
    };

    fetchGolfers();

    const deadline = new Date("07/13/24 03:45 AM MST");
    setIsSubmissionClosed(new Date() > deadline);
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.startsWith("golfer")) {
        const golfersValidation = validateGolfers({
          golfer1: value.golfer1,
          golfer2: value.golfer2,
          golfer3: value.golfer3,
          golfer4: value.golfer4,
          golfer5: value.golfer5,
          golfer6: value.golfer6,
        });
        if (golfersValidation === true) {
          clearErrors();
        } else {
          if (golfersValidation.includes("available golfers")) {
            [
              "golfer1",
              "golfer2",
              "golfer3",
              "golfer4",
              "golfer5",
              "golfer6",
            ].forEach((golfer) => {
              if (!availableGolfers.includes(value[golfer])) {
                setError(golfer, {
                  type: "manual",
                  message: "Invalid golfer selected.",
                });
              } else {
                clearErrors(golfer);
              }
            });
          } else if (golfersValidation.includes("top 10")) {
            [
              "golfer1",
              "golfer2",
              "golfer3",
              "golfer4",
              "golfer5",
              "golfer6",
            ].forEach((golfer) => {
              if (topGolfers.map((tg) => tg.name).includes(value[golfer])) {
                setError(golfer, {
                  type: "manual",
                  message: "Too many top 10 golfers selected.",
                });
              } else {
                clearErrors(golfer);
              }
            });
          } else if (golfersValidation.includes("same golfer")) {
            const golferCounts = {};
            [
              "golfer1",
              "golfer2",
              "golfer3",
              "golfer4",
              "golfer5",
              "golfer6",
            ].forEach((golfer) => {
              if (golferCounts[value[golfer]]) {
                golferCounts[value[golfer]] += 1;
                setError(golfer, {
                  type: "manual",
                  message: "Duplicate golfer selected.",
                });
              } else {
                golferCounts[value[golfer]] = 1;
                clearErrors(golfer);
              }
            });
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors, availableGolfers, topGolfers]);

  const validateGolfers = (golfers) => {
    const selectedGolfers = Object.values(golfers).filter((g) => g);
    const topGolfersCount = selectedGolfers.filter((g) =>
      topGolfers.map((tg) => tg.name).includes(g)
    ).length;
    const uniqueGolfers = new Set(selectedGolfers);

    if (selectedGolfers.some((golfer) => !availableGolfers.includes(golfer))) {
      return "All selected golfers must be from the available golfers list.";
    }
    if (topGolfersCount > 2) {
      return "You can only select up to 2 golfers from the top 10.";
    }
    if (uniqueGolfers.size !== selectedGolfers.length) {
      return "You cannot select the same golfer more than once.";
    }
    return true;
  };

  const onSubmit = async (data) => {
    clearErrors(); // Clear any existing errors

    const golfersValidation = validateGolfers({
      golfer1: data.golfer1,
      golfer2: data.golfer2,
      golfer3: data.golfer3,
      golfer4: data.golfer4,
      golfer5: data.golfer5,
      golfer6: data.golfer6,
    });

    if (golfersValidation !== true) {
      if (golfersValidation.includes("available golfers")) {
        [
          "golfer1",
          "golfer2",
          "golfer3",
          "golfer4",
          "golfer5",
          "golfer6",
        ].forEach((golfer) => {
          if (!availableGolfers.includes(data[golfer])) {
            setError(golfer, {
              type: "manual",
              message: "Invalid golfer selected.",
            });
          }
        });
      } else if (golfersValidation.includes("top 10")) {
        [
          "golfer1",
          "golfer2",
          "golfer3",
          "golfer4",
          "golfer5",
          "golfer6",
        ].forEach((golfer) => {
          if (topGolfers.map((tg) => tg.name).includes(data[golfer])) {
            setError(golfer, {
              type: "manual",
              message: "Too many top 10 golfers selected.",
            });
          }
        });
      } else if (golfersValidation.includes("same golfer")) {
        const golferCounts = {};
        [
          "golfer1",
          "golfer2",
          "golfer3",
          "golfer4",
          "golfer5",
          "golfer6",
        ].forEach((golfer) => {
          if (golferCounts[data[golfer]]) {
            golferCounts[data[golfer]] += 1;
            setError(golfer, {
              type: "manual",
              message: "Duplicate golfer selected.",
            });
          } else {
            golferCounts[data[golfer]] = 1;
          }
        });
      }
      Swal.fire("Error!", golfersValidation, "error");
      return;
    }

    Swal.fire({
      title: "Submitting your picks...",
      text: "Please wait while your picks are processed.",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("venmo", data.venmo);
      formData.append("name", data.name);
      formData.append("golfer1", data.golfer1);
      formData.append("golfer2", data.golfer2);
      formData.append("golfer3", data.golfer3);
      formData.append("golfer4", data.golfer4);
      formData.append("golfer5", data.golfer5);
      formData.append("golfer6", data.golfer6);
      formData.append("tiebreaker", data.tiebreaker);

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzgT8MN-ayPXXdjWJlJc-NeeCK_j5VTkDdpTxsJuolaKQI8sfA5bDW69jYsoRxrVcACiw/exec",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseJson = await response.json();

      if (responseJson.row) {
        const rowNumber = parseInt(responseJson.row) - 1;
        Swal.fire("Success!", `Submission ID: ${rowNumber}`, "success");
        reset();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      Swal.fire(
        "Oops!",
        "Something went wrong. Please try again later.",
        "error"
      );
    }
  };

  if (isSubmissionClosed) {
    return (
      <div className="text-center text-red-500 text-xl font-bold mt-8">
        Sorry, submissions are now closed.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-12">
      <section className="bg-gray-800 shadow-xl rounded-lg p-6 space-y-6">
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faDollarSign}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                <strong>$25 entry fee.</strong> WINNER TAKE ALL
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                <strong>
                  Winner will be paid on the Monday after the tournament by 3 PM
                  EST.
                </strong>
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faGolfBall}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                <strong>Pick 6 golfers</strong> competing in the tournament.
                Your top 5 golfers will count. That means your worst golfer's
                score at the end of Sunday will be dropped.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                You are allowed to only take{" "}
                <strong>2 golfers in the Vegas Top 10 odds</strong> favorites to
                win the tournament (LIST BELOW).
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faListOl}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                The pool runs similar to the game of golf. Your{" "}
                <strong>6 golfer's scores</strong> after their rounds will be
                added up. The lower the better.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                If one of your selected golfers{" "}
                <strong>does not make the cut</strong>, he will be scored an 80
                on Saturday and Sunday.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                If one of your selected golfers <strong>withdraws</strong>, he
                will be scored an 80 for all four rounds.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                If one of your selected golfers <strong>is disqualified</strong>
                , he will be scored an 80 for all four rounds.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faGolfBall}
              className="text-emerald-400 mt-1"
            />
            <div className="text-left">
              <p className="text-lg">
                Along with your golfers I will need a{" "}
                <strong>tie breaker</strong>. The tie breaker is your prediction
                of what the champion's final score to par will be. Example:
                Scottie Scheffler won last year's Masters shooting -10, meaning
                a -10 on the total tournament would have been the right tie
                breaker.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon icon={faClock} className="text-emerald-400 mt-1" />
            <div className="text-left">
              <p className="text-lg">
                <strong>Leaderboard</strong> will update automatically.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon icon={faClock} className="text-emerald-400 mt-1" />
            <div className="text-left">
              <p className="text-lg">
                Submissions will be accepted all the way up to the first tee
                time on Thursday which is typically at 8:00 am.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon icon={faUsers} className="text-emerald-400 mt-1" />
            <div className="text-left">
              <p className="text-lg">
                Feel free to forward to friends or family that may be
                interested!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-emerald-100 p-4 rounded-lg">
            <FontAwesomeIcon icon={faCreditCard} className="text-emerald-400" />
            <div className="text-center">
              <p className="text-lg text-emerald-900">
                <strong>Venmo</strong> is the preferred payment method
                (@pblang). Easy collect, easy send off.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-red-100 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-lg text-red-900 font-semibold">
                IF PAYMENT IS NOT RECEIVED BY FIRST TEE TIME YOU WILL BE
                DISQUALIFIED
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 shadow-xl rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
          Vegas Top 10
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topGolfers.map((golfer) => (
            <div
              key={golfer.name}
              className="p-3 bg-gray-700 rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="text-white font-medium">{golfer.name}</div>
              <div className="text-emerald-400 font-bold">{golfer.odds}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-800 shadow-xl rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
          Submit Your Picks
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-gray-300 font-medium">
                Email
              </label>
              <input
                id="email"
                className={`w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.email ? "ring-red-500" : "focus:ring-emerald-400"
                } border ${
                  errors.email ? "border-red-500" : "border-gray-600"
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: /^\S+@\S+$/i,
                })}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="venmo" className="text-gray-300 font-medium">
                Venmo
              </label>
              <input
                id="venmo"
                className={`w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 ${
                  errors.venmo ? "ring-red-500" : "focus:ring-emerald-400"
                } border ${
                  errors.venmo ? "border-red-500" : "border-gray-600"
                }`}
                {...register("venmo", {
                  required: "Venmo username is required",
                })}
              />
              {errors.venmo && (
                <span className="text-red-500 text-sm">
                  {errors.venmo.message}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-gray-300 font-medium">
              Name
            </label>
            <input
              id="name"
              className={`w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 ${
                errors.name ? "ring-red-500" : "focus:ring-emerald-400"
              } border ${errors.name ? "border-red-500" : "border-gray-600"}`}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={`golfer${index}`} className="space-y-2">
                <label
                  htmlFor={`golfer${index}`}
                  className="text-gray-300 font-medium"
                >
                  Golfer {index}
                </label>
                <Autocomplete
                  options={availableGolfers}
                  value={watch(`golfer${index}`) || ""}
                  onChange={(value) => setValue(`golfer${index}`, value)}
                  error={errors[`golfer${index}`]}
                />
                {errors[`golfer${index}`] && (
                  <span className="text-red-500 text-sm">
                    {errors[`golfer${index}`].message}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="tiebreaker" className="text-gray-300 font-medium">
              Tie Breaker (Score)
            </label>
            <input
              id="tiebreaker"
              type="number"
              className={`w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 ${
                errors.tiebreaker ? "ring-red-500" : "focus:ring-emerald-400"
              } border ${
                errors.tiebreaker ? "border-red-500" : "border-gray-600"
              }`}
              {...register("tiebreaker", {
                required: "Tie breaker score is required",
              })}
            />
            {errors.tiebreaker && (
              <span className="text-red-500 text-sm">
                {errors.tiebreaker.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-emerald-500 rounded-lg text-white font-bold hover:bg-emerald-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Submit
          </button>
        </form>
      </section>
    </div>
  );
};

export default Form;
