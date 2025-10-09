import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function DetailsPage() {
  const { type, id } = useParams();
  const [details, setDetails] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/details/${type}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDetails(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetails();
  }, [type, id, token]);

  if (!details) return <p>Loading...</p>;

  return (
    <div className="details-page">
      <h2>{details.name || details.title}</h2>
      <div className="details-info">
        {Object.entries(details).map(([key, value]) => (
          <p key={key}>
            <strong>{key.replace(/_/g, " ").toUpperCase()}: </strong>
            {Array.isArray(value) ? value.join(", ") : value || "N/A"}
          </p>
        ))}
      </div>
    </div>
  );
}
