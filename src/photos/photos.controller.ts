import { Body, Controller, Delete, Get, Param, Patch } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { PhotosService } from "./photos.service";
import { UpdatePhotoDto } from "./dto";

@ApiTags("photos")
@Controller("photos")
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  @ApiOperation({ summary: "Get all photos" })
  @ApiResponse({ status: 200, description: "Returns all photos" })
  findAll() {
    return this.photosService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get photo by ID" })
  @ApiParam({ name: "id", description: "Photo ID" })
  @ApiResponse({ status: 200, description: "Returns the photo" })
  @ApiResponse({ status: 404, description: "Photo not found" })
  findOne(@Param("id") id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a photo" })
  @ApiParam({ name: "id", description: "Photo ID" })
  @ApiResponse({ status: 200, description: "Photo updated successfully" })
  @ApiResponse({ status: 404, description: "Photo not found" })
  update(@Param("id") id: string, @Body() body: UpdatePhotoDto) {
    return this.photosService.update(id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a photo" })
  @ApiParam({ name: "id", description: "Photo ID" })
  @ApiResponse({ status: 200, description: "Photo deleted successfully" })
  @ApiResponse({ status: 404, description: "Photo not found" })
  remove(@Param("id") id: string) {
    return this.photosService.remove(id);
  }
}
