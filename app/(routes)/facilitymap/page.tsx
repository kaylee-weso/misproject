import MapComponent from "@/components/map/map";

export default function FacilityMapPage() {
  return (
    <div className="page">
        <h1 className="page-header">Facility Map</h1>
        <div
            className="overflow-hidden mb-4"
            style={{ width: "100%", height: "500px" }}
          >
            <MapComponent/>
         </div>
    </div>
  );
}