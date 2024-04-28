"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { api_token } from "../api_secrets";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import { CarDetails } from "../components/CarDetails";
import Image from "next/image";
import * as turf from "@turf/turf";
import Header from "../components/Header";
import {
  floatProposal,
  createProposal,
  createUser,
  getUserIsActive,
  markFulfilment,
} from "./integration/Scripts.js";
export default function Home() {
  const [long, setLong] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [lat, setLat] = useState(null);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [search, setSearch] = useState(false);
  const mapContainerRef = useRef(null);
  const [coords, setCoords] = useState("");
  const mapRef = useRef(null);
  const directionsControlRef = useRef(null);
  const polyline = require("@mapbox/polyline");
  const [journey, setJourney] = useState(false);
  const [booked, setBooked] = useState(false);
  useEffect(() => {
    function successLocation(position) {
      console.log("Latitude:", position.coords.latitude);
      console.log("Longitude:", position.coords.longitude);
      setLong(position.coords.longitude);
      setLat(position.coords.latitude);
    }
    function errorLocation(error) {
      console.error("Error retrieving location:", error);
    }
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
      enableHighAccuracy: true,
    });
  }, []);
  /**
   * Checks if user exists, if not, creates one
   */
  useEffect(() => {
    async function f() {
      const tx = await getUserIsActive();
      if (tx === false) {
        const cr = await createUser();
        if (cr) console.log(cr);
        else console.log("User created!!");
      } else {
        console.log(tx);
      }
    }
  }, []);
  useEffect(() => {
    if (long !== null && lat !== null) {
      mapboxgl.accessToken = api_token;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [long, lat],
        zoom: 9,
      });
      mapRef.current = map;
      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        profile: "mapbox/driving",
        unit: "metric",
      });
      directionsControlRef.current = directions;
      map.addControl(directions, "top-left");
      directions.on("route", handleRoute);
    }
  }, [long, lat]);
  useEffect(() => {
    if (mapRef.current && endLocation) {
      console.log(startLocation);
      const metersToPixelsAtMaxZoom = (meters, latitude) =>
        meters / 0.075 / Math.cos((latitude * Math.PI) / 180);
      const radiusInMeters = 200;
      mapRef.current.addLayer({
        id: "circleLayer",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: endLocation,
            },
          },
        },
        paint: {
          "circle-radius": {
            stops: [
              [0, 0],
              [20, metersToPixelsAtMaxZoom(radiusInMeters, endLocation[1])],
            ],
            base: 2,
          },
          "circle-color": "#ff0000",
          "circle-opacity": 0.6,
        },
      });
    }
  }, [endLocation]);
  const handleRoute = (event) => {
    const route = event.route[0];
    console.log(route);
    setStartLocation(route.legs[0].steps[0].maneuver.location);
    setEndLocation(
      route.legs[0].steps[route.legs[0].steps.length - 1].maneuver.location
    );
    const decodedPolyline = polyline.decode(route.geometry);
    setCoords(
      decodedPolyline.map((point) => ({
        lng: point[0],
        lat: point[1],
      }))
    );
  };
  useEffect(() => {
    async function f() {
      if (startLocation !== "" && coords !== "" && journey) {
        console.log(coords);
        const marker = new mapboxgl.Marker()
          .setLngLat([startLocation[0], startLocation[1]])
          .addTo(mapRef.current);
        let index = 0,
          spec = 0;
        const intervalId = setInterval(() => {
          if (index < coords.length) {
            const lngg = coords[index].lng;
            const latt = coords[index].lat;
            marker.setLngLat([latt, lngg]);
            if (spec === 0 && isInsideGeofence([latt, lngg])) {
              alert("Driver crossed the GeoFence!");
              spec = 1;
            }
            index++;
          } else {
            clearInterval(intervalId);
          }
        }, 10);
        if (spec === 1) {
          try {
            const tx = await markFulfilment(1);
            if (tx) throw tx;
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
  }, [startLocation, coords, journey]);
  const handleSearch = async () => {
    try {
      const tx = await createProposal(
        "0x4b318DF2Ae31a0272878DCb7b620ACdf3113bFc7",
        1e15
      );
      if (tx) throw tx;
      setSearch(true);
    } catch (err) {
      console.log(err);
    }
  };
  const handleBooking = () => {
    setBooked(true);
    setSearch(false);
    setJourney(true);
    setShowMessage(true);
  };
  const earthRadius = 6371000;
  const radius = 200;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const geofenceCoordinates = [];
  for (let i = 0; i <= 360; i += 10) {
    const bearing = toRadians(i);
    const lat = Math.asin(
      Math.sin(toRadians(endLocation[1])) * Math.cos(radius / earthRadius) +
        Math.cos(toRadians(endLocation[1])) *
          Math.sin(radius / earthRadius) *
          Math.cos(bearing)
    );
    const lng =
      toRadians(endLocation[0]) +
      Math.atan2(
        Math.sin(bearing) *
          Math.sin(radius / earthRadius) *
          Math.cos(toRadians(endLocation[1])),
        Math.cos(radius / earthRadius) -
          Math.sin(toRadians(endLocation[1])) * Math.sin(lat)
      );
    geofenceCoordinates.push([(lng * 180) / Math.PI, (lat * 180) / Math.PI]);
  }
  const isInsideGeofence = (point) => {
    const polygon = turf.polygon([geofenceCoordinates]);
    const pt = turf.point(point);
    return turf.booleanPointInPolygon(pt, polygon);
  };
  return (
    <div className="flex flex-col">
      <div>
        <Header />
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex flex-col">
          <div className="p-2 md:pd-6 border-[2px] rounded-xl h-3/5">
            <p className="text-[20px] font-bold">Get a Ride</p>
            <div className="bg-slate-200 p-3 rounded-lg mt-3 flex items-center gap-4">
              <Image src="/location.png" width={15} height={15} />
              <input
                type="text"
                value={startLocation}
                placeholder="Pickup Location"
                className="bg-transparent w-full outline-none"
              />
            </div>
            <div className="bg-slate-200 p-3 rounded-lg mt-3 flex items-center gap-4">
              <Image src="/location.png" width={15} height={15} />
              <input
                type="text"
                value={endLocation}
                placeholder="Dropoff Location"
                className="bg-transparent w-full outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={startLocation === ""}
              className={`p-3 ${
                startLocation === "" ? "bg-gray-500" : "bg-black"
              } w-full mt-5 text-white rounded-lg`}
            >
              Search
            </button>
          </div>
          {search ? (
            <div className="flex flex-col gap-y-6 py-4 justfify-center text-center items-center mx-auto">
              {CarDetails.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-y-2 border border-gray-500 rounded-lg bg-slate-200 px-20 py-4"
                >
                  <div className="flex justfify-between text-center items-center mx-auto gap-x-6">
                    <div className="flex flex-col justfify-center text-center items-center mx-auto">
                      <Image src={item.image} width={150} height={150} />
                      <h1 className="text-xl">{item.header}</h1>
                    </div>
                    <div className="justfify-center text-center items-center mx-auto">
                      <h1 className="font-bold text-2xl">{item.price}</h1>
                    </div>
                  </div>
                  <div className="w-full bg-black py-2 text-white rounded-lg">
                    <button onClick={handleBooking}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div></div>
          )}
          {booked && showMessage ? (
            <div className="flex flex-col bg-green-400 px-2 py-4 mt-10 rounded-lg mx-auto justify-center text-center items-center">
              <h1 className="text-5xl text-white">Ride Confirmed</h1>
              <Image src="/tick.png" width={100} height={100} />
            </div>
          ) : (
            <div></div>
          )}
        </div>
        <div className="col-span-2">
          <div>
            <div
              ref={mapContainerRef}
              id="map"
              style={{ width: "100%", height: "400px" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
